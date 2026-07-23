import cron from 'node-cron';
import { db } from '@/lib/firebaseAdmin';
import { generateDailyNewsletter } from './newsletterService';
import { getNewsletterTemplate } from './newsletterService';
import { sendBulkNewsletters } from './emailService';

let cronJobs = [];

/**
 * Initialize all cron jobs
 */
export function initializeCronJobs() {
    console.log('🚀 Initializing newsletter cron jobs...');

    // Daily newsletter at 8:00 AM for anytime testing * * * * *
    const dailyNewsletterJob = cron.schedule('0 8 * * *', async () => {
        console.log('📧 Running daily newsletter job...');
        await sendDailyNewsletters();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata" // Change to your timezone
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
        // Get all active subscribers with daily frequency from Firestore
        const subscribersSnapshot = await db.collection('newsletterSubscriptions')
            .where('isActive', '==', true)
            .where('frequency', '==', 'daily')
            .get();

        if (subscribersSnapshot.empty) {
            console.log('No daily subscribers found');
            return;
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
            return;
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
        
        if (results.errors.length > 0) {
            console.log('   Errors:', results.errors);
        }

    } catch (error) {
        console.error('Error in daily newsletter job:', error);
    }
}

/**
 * Send weekly newsletters
 */
async function sendWeeklyNewsletters() {
    try {
        // Get all active subscribers with weekly frequency from Firestore
        const subscribersSnapshot = await db.collection('newsletterSubscriptions')
            .where('isActive', '==', true)
            .where('frequency', '==', 'weekly')
            .get();

        if (subscribersSnapshot.empty) {
            console.log('No weekly subscribers found');
            return;
        }

        const subscribers = subscribersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`Found ${subscribers.length} weekly subscribers`);

        // Generate weekly roundup
        const newsletterData = await generateDailyNewsletter(); // You can create a separate weekly generator

        if (!newsletterData.success) {
            console.error('Failed to generate weekly newsletter:', newsletterData.error);
            return;
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

        // Update lastSentAt for successful sends using Firestore batch
        const batch = db.batch();
        subscribers.forEach(sub => {
            const docRef = db.collection('newsletterSubscriptions').doc(sub.id);
            batch.update(docRef, { lastSentAt: new Date() });
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
