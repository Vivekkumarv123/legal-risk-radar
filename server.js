// Server initialization for cron jobs
// This file should be imported in your main app entry point

import { initializeServer } from './src/lib/initServer.js';

// Initialize server services (cron jobs, etc.)
if (typeof window === 'undefined') {
    // Only run on server-side
    initializeServer();
}

export { initializeServer };
