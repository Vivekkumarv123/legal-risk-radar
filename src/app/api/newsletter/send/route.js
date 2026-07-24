import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { generateDailyNewsletter, generateWeeklyNewsletter, getNewsletterTemplate } from '@/services/newsletterService';
import { sendBulkNewsletters } from '@/services/emailService';

function getISOWeekIdentifier(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// Manual trigger for newsletter sending (admin only)
export async function POST(request) {
    try {
        const body = await request.json();
        const { type, force = false } = body; // 'daily' or 'weekly', force = true to ignore idempotency

        if (type === 'daily') {
            const result = await sendDailyNewsletter(force);
            return NextResponse.json(result);
        } else if (type === 'weekly') {
            const result = await sendWeeklyNewsletter(force);
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
 * Send daily newsletters to active subscribers
 */
async function sendDailyNewsletter(force = false) {
    try {
        const todayDateString = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

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

        const allSubscribers = subscribersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const eligibleSubscribers = force
            ? allSubscribers
            : allSubscribers.filter(sub => sub.lastNewsletterDate !== todayDateString);

        if (eligibleSubscribers.length === 0) {
            return {
                success: true,
                message: `All subscribers already received daily newsletter today (${todayDateString})`,
                sent: 0
            };
        }

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

        const newsletterData = await generateDailyNewsletter();

        if (!newsletterData.success) {
            return {
                success: false,
                error: 'Failed to generate newsletter content'
            };
        }

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
        recipients.forEach(rec => {
            const docRef = db.collection('newsletterSubscriptions').doc(rec.id);
            batch.update(docRef, {
                lastNewsletterDate: todayDateString,
                lastSentAt: new Date(),
                updatedAt: new Date()
            });
        });
        await batch.commit();

        return {
            success: true,
            message: 'Daily newsletter sent successfully',
            stats: {
                todayDateString,
                subscribers: recipients.length,
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
async function sendWeeklyNewsletter(force = false) {
    try {
        const currentWeekId = getISOWeekIdentifier();

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

        const allSubscribers = subscribersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const eligibleSubscribers = force
            ? allSubscribers
            : allSubscribers.filter(sub => sub.lastWeeklyNewsletterDate !== currentWeekId);

        if (eligibleSubscribers.length === 0) {
            return {
                success: true,
                message: `All subscribers already received weekly newsletter for ${currentWeekId}`,
                sent: 0
            };
        }

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

        const newsletterData = await generateWeeklyNewsletter();

        if (!newsletterData.success) {
            return {
                success: false,
                error: 'Failed to generate weekly newsletter content'
            };
        }

        const subject = `Weekly Legal Roundup Digest - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
        
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
        recipients.forEach(rec => {
            const docRef = db.collection('newsletterSubscriptions').doc(rec.id);
            batch.update(docRef, {
                lastWeeklyNewsletterDate: currentWeekId,
                lastSentAt: new Date(),
                updatedAt: new Date()
            });
        });
        await batch.commit();

        return {
            success: true,
            message: 'Weekly newsletter sent successfully',
            stats: {
                currentWeekId,
                subscribers: recipients.length,
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

