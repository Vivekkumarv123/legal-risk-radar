import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { generateDailyNewsletter, getNewsletterTemplate } from '@/services/newsletterService';
import { sendBulkNewsletters } from '@/services/emailService';

/**
 * Vercel Cron Job: Daily Newsletter
 * Runs every day at 8:00 AM (Asia/Kolkata)
 * Schedule: 0 8 * * * (configured in vercel.json)
 */
export async function GET(request) {
    try {
        console.log('📧 Running daily newsletter cron job...');

        // Get all active subscribers with daily frequency from Firestore
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
            });
        }

        const subscribers = subscribersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`Found ${subscribers.length} daily subscribers`);

        // Generate newsletter content
        const newsletterData = await generateDailyNewsletter();

        if (!newsletterData.success) {
            console.error('Failed to generate newsletter:', newsletterData.error);
            return NextResponse.json({
                success: false,
                error: 'Failed to generate newsletter content'
            }, { status: 500 });
        }

        // Prepare recipients
        const recipients = subscribers.map(sub => ({
            email: sub.email,
            name: sub.name || 'Legal Enthusiast',
            unsubscribeToken: sub.unsubscribeToken
        }));

        // Send newsletters
        const subject = `Legal Newsletter - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        
        const results = await sendBulkNewsletters(
            recipients,
            subject,
            (recipient) => getNewsletterTemplate(
                newsletterData.content,
                recipient.name,
                recipient.unsubscribeToken
            )
        );

        // Update lastSentAt for successful sends using Firestore batch
        const batch = db.batch();
        subscribers.forEach(sub => {
            const docRef = db.collection('newsletterSubscriptions').doc(sub.id);
            batch.update(docRef, { lastSentAt: new Date() });
        });
        await batch.commit();

        console.log('📊 Newsletter sending results:');
        console.log(`   ✅ Sent: ${results.sent}`);
        console.log(`   ❌ Failed: ${results.failed}`);

        return NextResponse.json({
            success: true,
            message: 'Daily newsletter sent successfully',
            stats: {
                subscribers: subscribers.length,
                sent: results.sent,
                failed: results.failed,
                errors: results.errors
            }
        });

    } catch (error) {
        console.error('Error in daily newsletter cron:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
