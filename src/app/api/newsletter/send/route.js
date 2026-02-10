import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { generateDailyNewsletter, getNewsletterTemplate } from '@/services/newsletterService';
import { sendBulkNewsletters } from '@/services/emailService';

// Manual trigger for newsletter sending (admin only)
export async function POST(request) {
    try {
        // TODO: Add admin authentication check here
        const body = await request.json();
        const { type } = body; // 'daily' or 'weekly'

        if (type === 'daily') {
            const result = await sendDailyNewsletter();
            return NextResponse.json(result);
        } else if (type === 'weekly') {
            const result = await sendWeeklyNewsletter();
            return NextResponse.json(result);
        } else {
            return NextResponse.json(
                { success: false, error: 'Invalid newsletter type. Use "daily" or "weekly"' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('Newsletter send error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send newsletter' },
            { status: 500 }
        );
    }
}

/**
 * Send daily newsletters to all active subscribers
 */
async function sendDailyNewsletter() {
    try {
        const subscribersSnapshot = await db.collection('newsletterSubscriptions')
            .where('isActive', '==', true)
            .where('frequency', '==', 'daily')
            .get();

        if (subscribersSnapshot.empty) {
            return {
                success: true,
                message: 'No daily subscribers found',
                sent: 0
            };
        }

        const subscribers = subscribersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const newsletterData = await generateDailyNewsletter();

        if (!newsletterData.success) {
            return {
                success: false,
                error: 'Failed to generate newsletter content'
            };
        }

        const recipients = subscribers.map(sub => ({
            email: sub.email,
            name: sub.name || 'Legal Enthusiast',
            unsubscribeToken: sub.unsubscribeToken
        }));

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

        const batch = db.batch();
        subscribers.forEach(sub => {
            const docRef = db.collection('newsletterSubscriptions').doc(sub.id);
            batch.update(docRef, { lastSentAt: new Date() });
        });
        await batch.commit();

        return {
            success: true,
            message: 'Daily newsletter sent successfully',
            stats: {
                subscribers: subscribers.length,
                sent: results.sent,
                failed: results.failed
            }
        };

    } catch (error) {
        console.error('Error sending daily newsletter:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Send weekly newsletters
 */
async function sendWeeklyNewsletter() {
    try {
        const subscribersSnapshot = await db.collection('newsletterSubscriptions')
            .where('isActive', '==', true)
            .where('frequency', '==', 'weekly')
            .get();

        if (subscribersSnapshot.empty) {
            return {
                success: true,
                message: 'No weekly subscribers found',
                sent: 0
            };
        }

        const subscribers = subscribersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const newsletterData = await generateDailyNewsletter();

        if (!newsletterData.success) {
            return {
                success: false,
                error: 'Failed to generate newsletter content'
            };
        }

        const recipients = subscribers.map(sub => ({
            email: sub.email,
            name: sub.name || 'Legal Enthusiast',
            unsubscribeToken: sub.unsubscribeToken
        }));

        const subject = `Weekly Legal Roundup - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        
        const results = await sendBulkNewsletters(
            recipients,
            subject,
            (recipient) => getNewsletterTemplate(
                newsletterData.content,
                recipient.name,
                recipient.unsubscribeToken
            )
        );

        const batch = db.batch();
        subscribers.forEach(sub => {
            const docRef = db.collection('newsletterSubscriptions').doc(sub.id);
            batch.update(docRef, { lastSentAt: new Date() });
        });
        await batch.commit();

        return {
            success: true,
            message: 'Weekly newsletter sent successfully',
            stats: {
                subscribers: subscribers.length,
                sent: results.sent,
                failed: results.failed
            }
        };

    } catch (error) {
        console.error('Error sending weekly newsletter:', error);
        return {
            success: false,
            error: error.message
        };
    }
}
