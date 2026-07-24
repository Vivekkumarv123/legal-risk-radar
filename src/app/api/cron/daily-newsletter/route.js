import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { generateDailyNewsletter, getNewsletterTemplate } from '@/services/newsletterService';
import { sendBulkNewsletters } from '@/services/emailService';
import crypto from 'crypto';

/**
 * Verify Cron Authorization with constant-time token comparison
 */
function verifyCronAuth(request) {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) return true; // If secret not set in env, allow (dev mode)

    const authHeader = request.headers.get('authorization');
    if (!authHeader) return false;

    const expectedToken = `Bearer ${cronSecret}`;
    if (authHeader.length !== expectedToken.length) return false;

    return crypto.timingSafeEqual(Buffer.from(authHeader), Buffer.from(expectedToken));
}

async function handleDailyNewsletterCron(request) {
    const startTime = Date.now();
    try {
        if (!verifyCronAuth(request)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401, headers: { 'Cache-Control': 'no-store, max-age=0' } }
            );
        }

        console.log('📧 Running daily newsletter cron job...');
        const todayDateString = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD format

        // Fetch active daily subscribers
        const subscribersSnapshot = await db.collection('newsletterSubscriptions')
            .where('isActive', '==', true)
            .where('frequency', '==', 'daily')
            .get();

        if (subscribersSnapshot.empty) {
            console.log('No daily subscribers found');
            return NextResponse.json({
                success: true,
                message: 'No daily subscribers found',
                sent: 0
            }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
        }

        // Idempotency Filter: Exclude subscribers who already received newsletter today
        const allSubscribers = subscribersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const eligibleSubscribers = allSubscribers.filter(sub => sub.lastNewsletterDate !== todayDateString);

        if (eligibleSubscribers.length === 0) {
            console.log(`✅ All ${allSubscribers.length} subscribers have already received today's newsletter (${todayDateString}). Skipping.`);
            return NextResponse.json({
                success: true,
                message: `All daily subscribers already received today's newsletter (${todayDateString})`,
                subscribersCount: allSubscribers.length,
                eligibleCount: 0,
                sent: 0
            }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
        }

        // Deduplicate recipients by email
        const recipientMap = new Map();
        eligibleSubscribers.forEach(sub => {
            const normalizedEmail = (sub.email || '').toLowerCase().trim();
            if (normalizedEmail && !recipientMap.has(normalizedEmail)) {
                recipientMap.set(normalizedEmail, {
                    id: sub.id,
                    email: normalizedEmail,
                    name: sub.name || 'Legal Enthusiast',
                    unsubscribeToken: sub.unsubscribeToken
                });
            }
        });

        const recipients = Array.from(recipientMap.values());
        console.log(`Found ${recipients.length} eligible daily subscribers for ${todayDateString}`);

        // Generate AI Newsletter Content
        const newsletterData = await generateDailyNewsletter();

        if (!newsletterData.success) {
            console.error('Failed to generate daily newsletter:', newsletterData.error);
            return NextResponse.json({
                success: false,
                error: 'Failed to generate newsletter content'
            }, { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } });
        }

        const subject = `Legal Newsletter - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

        // Send newsletters
        const results = await sendBulkNewsletters(
            recipients,
            subject,
            (recipient) => getNewsletterTemplate(
                newsletterData.content,
                recipient.name,
                recipient.unsubscribeToken
            )
        );

        // Update lastNewsletterDate and lastSentAt in Firestore batch
        const batch = db.batch();
        recipients.forEach(rec => {
            const docRef = db.collection('newsletterSubscriptions').doc(rec.id);
            batch.update(docRef, {
                lastNewsletterDate: todayDateString,
                lastSentAt: new Date(),
                updatedAt: new Date()
            });
        });
        await batch.commit();

        const durationMs = Date.now() - startTime;
        console.log(`📊 Daily Newsletter Cron complete in ${durationMs}ms: Sent ${results.sent}, Failed ${results.failed}`);

        return NextResponse.json({
            success: true,
            message: 'Daily newsletter processed successfully',
            stats: {
                todayDateString,
                theme: newsletterData.theme,
                grounded: newsletterData.grounded,
                totalSubscribers: allSubscribers.length,
                eligibleSubscribers: recipients.length,
                sent: results.sent,
                failed: results.failed,
                durationMs,
                errors: results.errors
            }
        }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });

    } catch (error) {
        console.error('Error in daily newsletter cron:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } }
        );
    }
}

export async function GET(request) {
    return handleDailyNewsletterCron(request);
}

export async function POST(request) {
    return handleDailyNewsletterCron(request);
}

