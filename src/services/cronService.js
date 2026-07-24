import cron from 'node-cron';
import { db } from '@/lib/firebaseAdmin';
import { generateDailyNewsletter, generateWeeklyNewsletter, getNewsletterTemplate } from './newsletterService';
import { sendBulkNewsletters } from './emailService';

let cronJobs = [];

function getISOWeekIdentifier(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Initialize all cron jobs
 */
export function initializeCronJobs() {
    console.log('🚀 Initializing newsletter cron jobs...');

    // Daily newsletter at 8:00 AM
    const dailyNewsletterJob = cron.schedule('0 8 * * *', async () => {
        console.log('📧 Running daily newsletter job...');
        await sendDailyNewsletters();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    cronJobs.push({ name: 'Daily Newsletter', job: dailyNewsletterJob });

    // Weekly newsletter on Monday at 9:00 AM
    const weeklyNewsletterJob = cron.schedule('0 9 * * 1', async () => {
        console.log('📧 Running weekly newsletter job...');
        await sendWeeklyNewsletters();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    cronJobs.push({ name: 'Weekly Newsletter', job: weeklyNewsletterJob });

    console.log('✅ Cron jobs initialized successfully');
    console.log(`   - Daily Newsletter: Every day at 8:00 AM`);
    console.log(`   - Weekly Newsletter: Every Monday at 9:00 AM`);
}

/**
 * Send daily newsletters to all active subscribers
 */
async function sendDailyNewsletters() {
    try {
        const todayDateString = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

        const subscribersSnapshot = await db.collection('newsletterSubscriptions')
            .where('isActive', '==', true)
            .where('frequency', '==', 'daily')
            .get();

        if (subscribersSnapshot.empty) {
            console.log('No daily subscribers found');
            return;
        }

        const allSubscribers = subscribersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const eligibleSubscribers = allSubscribers.filter(sub => sub.lastNewsletterDate !== todayDateString);

        if (eligibleSubscribers.length === 0) {
            console.log(`All subscribers already received daily newsletter today (${todayDateString}). Skipping.`);
            return;
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
        console.log(`Found ${recipients.length} eligible daily subscribers for ${todayDateString}`);

        const newsletterData = await generateDailyNewsletter();

        if (!newsletterData.success) {
            console.error('Failed to generate newsletter:', newsletterData.error);
            return;
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

        console.log('📊 Newsletter sending results:');
        console.log(`   ✅ Sent: ${results.sent}`);
        console.log(`   ❌ Failed: ${results.failed}`);

    } catch (error) {
        console.error('Error in daily newsletter job:', error);
    }
}

/**
 * Send weekly newsletters
 */
async function sendWeeklyNewsletters() {
    try {
        const currentWeekId = getISOWeekIdentifier();

        const subscribersSnapshot = await db.collection('newsletterSubscriptions')
            .where('isActive', '==', true)
            .where('frequency', '==', 'weekly')
            .get();

        if (subscribersSnapshot.empty) {
            console.log('No weekly subscribers found');
            return;
        }

        const allSubscribers = subscribersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const eligibleSubscribers = allSubscribers.filter(sub => sub.lastWeeklyNewsletterDate !== currentWeekId);

        if (eligibleSubscribers.length === 0) {
            console.log(`All weekly subscribers already received newsletter for week ${currentWeekId}. Skipping.`);
            return;
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
        console.log(`Found ${recipients.length} eligible weekly subscribers for week ${currentWeekId}`);

        const newsletterData = await generateWeeklyNewsletter();

        if (!newsletterData.success) {
            console.error('Failed to generate weekly newsletter:', newsletterData.error);
            return;
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

        console.log('📊 Weekly newsletter results:');
        console.log(`   ✅ Sent: ${results.sent}`);
        console.log(`   ❌ Failed: ${results.failed}`);

    } catch (error) {
        console.error('Error in weekly newsletter job:', error);
    }
}


/**
 * Stop all cron jobs
 */
export function stopAllCronJobs() {
    cronJobs.forEach(({ name, job }) => {
        job.stop();
        console.log(`Stopped cron job: ${name}`);
    });
    cronJobs = [];
}

/**
 * Get status of all cron jobs
 */
export function getCronJobsStatus() {
    return cronJobs.map(({ name, job }) => ({
        name,
        running: job.running || false
    }));
}

/**
 * Manually trigger daily newsletter (for testing)
 */
export async function triggerDailyNewsletter() {
    console.log('🔧 Manually triggering daily newsletter...');
    await sendDailyNewsletters();
}

/**
 * Manually trigger weekly newsletter (for testing)
 */
export async function triggerWeeklyNewsletter() {
    console.log('🔧 Manually triggering weekly newsletter...');
    await sendWeeklyNewsletters();
}
