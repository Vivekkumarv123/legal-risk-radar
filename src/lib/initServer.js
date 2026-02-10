/**
 * Server initialization for Vercel deployment
 * Note: Cron jobs are handled by Vercel Cron (see vercel.json)
 * This file is kept for future server-side initialization needs
 */

let isInitialized = false;

/**
 * Initialize server-side services
 * For Vercel: Cron jobs are configured in vercel.json and run as serverless functions
 */
export function initializeServer() {
    if (isInitialized) {
        console.log('⚠️  Server already initialized, skipping...');
        return;
    }

    console.log('🚀 Initializing server services...');

    try {
        // Vercel Cron Jobs are configured in vercel.json:
        // - Daily Newsletter: /api/cron/daily-newsletter (0 8 * * *)
        // - Weekly Newsletter: /api/cron/weekly-newsletter (0 9 * * 1)
        
        console.log('✅ Server running on Vercel - Cron jobs configured in vercel.json');
        
        isInitialized = true;
        console.log('✅ Server initialization complete');
    } catch (error) {
        console.error('❌ Server initialization failed:', error);
    }
}

export function isServerInitialized() {
    return isInitialized;
}
