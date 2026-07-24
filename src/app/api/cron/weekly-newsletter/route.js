import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { generateWeeklyNewsletter, getNewsletterTemplate } from '@/services/newsletterService';
import { sendBulkNewsletters } from '@/services/emailService';
import crypto from 'crypto';

/**
 * Verify Cron Authorization with constant-time token comparison
 */
function verifyCronAuth(request) {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) return true; // Allow in dev mode if secret not set

    const authHeader = request.headers.get('authorization');
    if (!authHeader) return false;

    const expectedToken = `Bearer ${cronSecret}`;
    if (authHeader.length !== expectedToken.length) return false;

    return crypto.timingSafeEqual(Buffer.from(authHeader), Buffer.from(expectedToken));
}

/**
 * Calculate ISO Week Identifier (e.g. 2026-W30)
 */
function getISOWeekIdentifier(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

async function handleWeeklyNewsletterCron(request) {
    const startTime = Date.now();
    try {
        if (!verifyCronAuth(request)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401, headers: { 'Cache-Control': 'no-store, max-age=0' } }
            );
        }

        console.log('📧 Running weekly newsletter cron job...');
        const currentWeekId = getISOWeekIdentifier();

        // Get active weekly subscribers
        const subscribersSnapshot = await db.collection('newsletterSubscriptions')
            .where('isActive', '==', true)
            .where('frequency', '==', 'weekly')
            .get();

        if (subscribersSnapshot.empty) {
            console.log('No weekly subscribers found');
            return NextResponse.json({
                success: true,
                message: 'No weekly subscribers found',
                sent: 0
            }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
        }

        const allSubscribers = subscribersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Idempotency Filter: Exclude subscribers who already received weekly newsletter this week
        const eligibleSubscribers = allSubscribers.filter(sub => sub.lastWeeklyNewsletterDate !== currentWeekId);

        if (eligibleSubscribers.length === 0) {
            console.log(`✅ All ${allSubscribers.length} weekly subscribers already received newsletter for week ${currentWeekId}. Skipping.`);
            return NextResponse.json({
                success: true,
                message: `All weekly subscribers already received newsletter for week ${currentWeekId}`,
                subscribersCount: allSubscribers.length,
                eligibleCount: 0,
                sent: 0
            }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
        }

        // Deduplicate by email
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
        console.log(`Found ${recipients.length} eligible weekly subscribers for week ${currentWeekId}`);

        // Generate Weekly AI Newsletter Content
        const newsletterData = await generateWeeklyNewsletter();

        if (!newsletterData.success) {
            console.error('Failed to generate weekly newsletter:', newsletterData.error);
            return NextResponse.json({
                success: false,
                error: 'Failed to generate weekly newsletter content'
            }, { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } });
        }

        const subject = `Weekly Legal Roundup Digest - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

        // Send bulk emails
        const results = await sendBulkNewsletters(
            recipients,
            subject,
            (recipient) => getNewsletterTemplate(
                newsletterData.content,
                recipient.name,
                recipient.unsubscribeToken
            )
        );

        // Update Firestore batch
        const batch = db.batch();
        recipients.forEach(rec => {
            const docRef = db.collection('newsletterSubscriptions').doc(rec.id);
            batch.update(docRef, {
                lastWeeklyNewsletterDate: currentWeekId,
                lastSentAt: new Date(),
                updatedAt: new Date()
            });
        });
        await batch.commit();

        const durationMs = Date.now() - startTime;
        console.log(`📊 Weekly Newsletter Cron complete in ${durationMs}ms: Sent ${results.sent}, Failed ${results.failed}`);

        return NextResponse.json({
            success: true,
            message: 'Weekly newsletter processed successfully',
            stats: {
                currentWeekId,
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
        console.error('Error in weekly newsletter cron:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } }
        );
    }
}

export async function GET(request) {
    return handleWeeklyNewsletterCron(request);
}

export async function POST(request) {
    return handleWeeklyNewsletterCron(request);
}

