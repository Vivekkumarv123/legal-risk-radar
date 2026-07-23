import { NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth.middleware';
import { Subscription } from '@/models/subscription.model';
import { PLANS } from '@/constants/plans';
import { calculateProratedAmount, formatCurrency } from '@/utils/subscription.utils';

export async function POST(request) {
    try {
        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { planId, billingCycle } = await request.json();

        if (!planId || !PLANS[planId]) {
            return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
        }

        const userId = authResult.user.uid;
        const newPlan = PLANS[planId];

        // Get current subscription
        const currentSubscription = await Subscription.findActiveByUser(userId);

        if (!currentSubscription || currentSubscription.planId === 'basic') {
            // No current subscription or on Basic plan, return full amount
            const isAnnual = billingCycle === 'annual';
            const fullAmount = isAnnual ? newPlan.price * 12 : newPlan.price;
            
            return NextResponse.json({
                success: true,
                isUpgrade: currentSubscription ? true : false,
                isProrated: false,
                fullAmount,
                proratedAmount: fullAmount,
                unusedCredit: 0,
                daysRemaining: 0,
                message: `Full payment for ${newPlan.displayName} plan`
            });
        }

        // Check if it's an upgrade from a paid plan
        if (currentSubscription.planId === 'pro' && planId === 'enterprise') {
            // Calculate pro-rated amount
            const prorationDetails = calculateProratedAmount(currentSubscription, newPlan, billingCycle);

            return NextResponse.json({
                success: true,
                isUpgrade: true,
                isProrated: true,
                ...prorationDetails,
                currentPlan: currentSubscription.planName,
                newPlan: newPlan.displayName,
                message: `Upgrading from ${currentSubscription.planName} to ${newPlan.displayName}`,
                breakdown: {
                    fullAmount: formatCurrency(prorationDetails.fullAmount),
                    unusedCredit: formatCurrency(prorationDetails.unusedCredit),
                    proratedAmount: formatCurrency(prorationDetails.proratedAmount),
                    daysRemaining: `${prorationDetails.daysRemaining} days remaining on current plan`
                }
            });
        }

        // Same plan or downgrade
        const isAnnual = billingCycle === 'annual';
        const fullAmount = isAnnual ? newPlan.price * 12 : newPlan.price;
        
        return NextResponse.json({
            success: true,
            isUpgrade: false,
            isProrated: false,
            fullAmount,
            proratedAmount: fullAmount,
            unusedCredit: 0,
            daysRemaining: 0,
            message: `Full payment for ${newPlan.displayName} plan`
        });

    } catch (error) {
        console.error('Calculate prorated error:', error);
        return NextResponse.json({ 
            error: 'Failed to calculate prorated amount',
            details: error.message 
        }, { status: 500 });
    }
}
