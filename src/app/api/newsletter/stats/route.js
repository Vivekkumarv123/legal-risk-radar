import { NextResponse } from 'next/server';
import { getRotationStats } from '@/lib/geminiKeyRotation';
import { db } from '@/lib/firebaseAdmin';

// Get newsletter statistics and API key rotation status
export async function GET(request) {
    try {
        // Get API key rotation stats
        const keyStats = getRotationStats();

        // Get subscriber statistics from Firestore
        const subscriptionsRef = db.collection('newsletterSubscriptions');
        
        // Get all active subscribers
        const activeSnapshot = await subscriptionsRef.where('isActive', '==', true).get();
        const totalSubscribers = activeSnapshot.size;
        
        // Count by frequency
        let dailySubscribers = 0;
        let weeklySubscribers = 0;
        const categoryCount = {};
        
        activeSnapshot.forEach(doc => {
            const data = doc.data();
            
            // Count frequency
            if (data.frequency === 'daily') dailySubscribers++;
            if (data.frequency === 'weekly') weeklySubscribers++;
            
            // Count categories
            if (data.categories && Array.isArray(data.categories)) {
                data.categories.forEach(cat => {
                    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
                });
            }
        });

        // Convert category counts to array and sort
        const categoryStats = Object.entries(categoryCount)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count);

        return NextResponse.json({
            success: true,
            data: {
                subscribers: {
                    total: totalSubscribers,
                    daily: dailySubscribers,
                    weekly: weeklySubscribers,
                    categories: categoryStats
                },
                apiKeys: keyStats,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get statistics' },
            { status: 500 }
        );
    }
}
