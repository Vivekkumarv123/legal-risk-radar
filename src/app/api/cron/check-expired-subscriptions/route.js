import { NextResponse } from 'next/server';
import { Subscription } from '@/models/subscription.model';
import { PLANS } from '@/constants/plans';
import { db } from '@/lib/firebaseAdmin';

export async function GET(request) {
    try {
        console.log('🔍 Checking for expired subscriptions...');

        // Get all active subscriptions
        const snapshot = await db.collection('subscriptions')
            .where('status', '==', 'active')
            .get();

        if (snapshot.empty) {
            console.log('No active subscriptions found');
            return NextResponse.json({ 
                success: true, 
                message: 'No active subscriptions to check',
                expired: 0
            });
        }

        const now = new Date();
        let expiredCount = 0;
        const expiredSubscriptions = [];

        // Check each subscription
        for (const doc of snapshot.docs) {
            const subscription = doc.data();
            const subscriptionId = doc.id;

            // Skip if no end date (Basic plan)
            if (!subscription.endDate) continue;

            const endDate = subscription.endDate.toDate ? subscription.endDate.toDate() : new Date(subscription.endDate);

            // Check if expired
            if (now > endDate) {
                expiredCount++;
                expiredSubscriptions.push({
                    id: subscriptionId,
                    userId: subscription.userId,
                    planId: subscription.planId,
                    endDate: endDate
                });

                // Cancel expired subscription
                await Subscription.cancel(subscriptionId);

                // Create Basic plan subscription
                const basicPlan = PLANS.basic;
                const features = {
                    aiQueries: basicPlan.limits?.dailyQueries || 5,
                    documentAnalysis: basicPlan.features?.documentAnalysis?.enabled || false,
                    voiceQueries: basicPlan.features?.voiceQueries?.enabled || false,
                    pdfReports: basicPlan.features?.pdfReports?.enabled || false,
                    prioritySupport: basicPlan.features?.prioritySupport?.enabled || false,
                    apiAccess: false,
                    teamCollaboration: 0,
                    contractComparison: basicPlan.features?.contractComparison?.enabled || false,
                    chromeExtension: basicPlan.features?.chromeExtension?.enabled || false,
                    newsletter: false,
                };

                await Subscription.create({
                    userId: subscription.userId,
                    planId: basicPlan.id,
                    planName: basicPlan.name,
                    status: 'active',
                    startDate: new Date(),
                    endDate: null,
                    price: basicPlan.price,
                    currency: basicPlan.currency,
                    features
                });

                console.log(`✅ Downgraded user ${subscription.userId} from ${subscription.planId} to Basic`);
            }
        }

        console.log(`✅ Expired subscriptions check complete: ${expiredCount} expired`);

        return NextResponse.json({
            success: true,
            message: `Checked ${snapshot.size} subscriptions, ${expiredCount} expired`,
            expired: expiredCount,
            expiredSubscriptions
        });

    } catch (error) {
        console.error('❌ Error checking expired subscriptions:', error);
        return NextResponse.json({ 
            error: 'Failed to check expired subscriptions',
            details: error.message 
        }, { status: 500 });
    }
}
