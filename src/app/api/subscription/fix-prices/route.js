import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { PLANS } from '@/constants/plans';

/**
 * One-time migration to fix subscription prices
 * This fixes subscriptions that have the total annual amount stored instead of monthly price
 */
export async function GET(request) {
    try {
        console.log('🔧 Starting subscription price fix...');

        // Get all active subscriptions
        const snapshot = await db.collection('subscriptions')
            .where('status', '==', 'active')
            .get();

        if (snapshot.empty) {
            return NextResponse.json({ 
                success: true, 
                message: 'No subscriptions to fix',
                fixed: 0
            });
        }

        let fixedCount = 0;
        const fixes = [];

        for (const doc of snapshot.docs) {
            const subscription = doc.data();
            const subscriptionId = doc.id;

            // Skip Basic plan
            if (subscription.planId === 'basic') continue;

            const plan = PLANS[subscription.planId];
            if (!plan) continue;

            // Check if subscription period is annual (around 365 days)
            const startDate = subscription.startDate?.toDate ? subscription.startDate.toDate() : new Date(subscription.startDate);
            const endDate = subscription.endDate?.toDate ? subscription.endDate.toDate() : new Date(subscription.endDate);
            const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            const isAnnual = totalDays >= 350;

            // If price is the annual total (monthly * 12), fix it to monthly
            const expectedAnnualTotal = plan.price * 12;
            const currentPrice = subscription.price;

            if (isAnnual && currentPrice === expectedAnnualTotal) {
                // Fix: Change from annual total to monthly price
                await db.collection('subscriptions').doc(subscriptionId).update({
                    price: plan.price
                });

                fixedCount++;
                fixes.push({
                    subscriptionId,
                    userId: subscription.userId,
                    planId: subscription.planId,
                    oldPrice: currentPrice,
                    newPrice: plan.price,
                    daysRemaining: Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24))
                });

                console.log(`✅ Fixed subscription ${subscriptionId}: ${currentPrice} → ${plan.price}`);
            }
        }

        console.log(`✅ Price fix complete: ${fixedCount} subscriptions fixed`);

        return NextResponse.json({
            success: true,
            message: `Fixed ${fixedCount} subscriptions`,
            fixed: fixedCount,
            details: fixes
        });

    } catch (error) {
        console.error('❌ Error fixing subscription prices:', error);
        return NextResponse.json({ 
            error: 'Failed to fix subscription prices',
            details: error.message 
        }, { status: 500 });
    }
}
