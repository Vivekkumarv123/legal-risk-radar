import { NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth.middleware';

// Track usage
export async function POST(request) {
    try {
        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, amount = 1 } = await request.json();

        if (!action) {
            return NextResponse.json({ error: 'Action is required' }, { status: 400 });
        }

        const userId = authResult.user.uid;

        // For now, just return success - we'll implement proper tracking later
        return NextResponse.json({
            success: true,
            message: `Tracked ${action} usage for user ${userId}`,
            usage: {
                userId,
                action,
                amount,
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('Track usage error:', error);
        return NextResponse.json({ error: 'Failed to track usage' }, { status: 500 });
    }
}

// Get usage statistics
export async function GET(request) {
    try {
        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = authResult.user.uid;

        // Mock usage data
        const mockUsage = {
            userId,
            month: new Date().toISOString().slice(0, 7),
            aiQueries: 2,
            documentsAnalyzed: 0,
            voiceQueries: 0,
            pdfReportsGenerated: 0,
            contractComparisons: 0
        };

        return NextResponse.json({
            success: true,
            currentUsage: mockUsage,
            usageHistory: [mockUsage],
            limits: {
                dailyQueries: 5,
                monthlyDocuments: 0
            }
        });

    } catch (error) {
        console.error('Get usage error:', error);
        return NextResponse.json({ error: 'Failed to get usage' }, { status: 500 });
    }
}