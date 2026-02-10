import { NextResponse } from 'next/server';
import { initializeServer, isServerInitialized } from '@/lib/initServer';

// This endpoint initializes the server (cron jobs, etc.)
// Call this once when the app starts or use it as a health check
export async function GET() {
    try {
        if (!isServerInitialized()) {
            initializeServer();
        }

        return NextResponse.json({
            success: true,
            message: 'Server initialized successfully',
            initialized: isServerInitialized(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Initialization error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to initialize server' },
            { status: 500 }
        );
    }
}
