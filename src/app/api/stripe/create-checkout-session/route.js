import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifyToken } from '@/middleware/auth.middleware';
import { PLANS } from '@/constants/plans';
import { Subscription } from '@/models/subscription.model';
import { calculateProratedAmount } from '@/utils/subscription.utils';

export async function POST(request) {
    try {
        // Check if Stripe key is configured
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error('❌ STRIPE_SECRET_KEY not configured');
            return NextResponse.json({ 
                error: 'Payment system not configured. Please contact support.',
                details: 'STRIPE_SECRET_KEY missing'
            }, { status: 500 });
        }

        // Check if APP_URL is configured
        if (!process.env.NEXT_PUBLIC_APP_URL) {
            console.error('❌ NEXT_PUBLIC_APP_URL not configured');
            return NextResponse.json({ 
                error: 'Application URL not configured. Please contact support.',
                details: 'NEXT_PUBLIC_APP_URL missing'
            }, { status: 500 });
        }

        // Validate APP_URL has proper scheme
        const appUrl = process.env.NEXT_PUBLIC_APP_URL;
        if (!appUrl.startsWith('http://') && !appUrl.startsWith('https://')) {
            console.error('❌ NEXT_PUBLIC_APP_URL missing scheme:', appUrl);
            return NextResponse.json({ 
                error: 'Application URL misconfigured. Please contact support.',
                details: 'NEXT_PUBLIC_APP_URL must start with http:// or https://'
            }, { status: 500 });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { planId, billingCycle } = await request.json();

        if (!planId || !PLANS[planId]) {
            return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
        }

        const userId = authResult.user.uid;
        const userEmail = authResult.user.email;
        const plan = PLANS[planId];

        // Calculate price based on billing cycle
        const isAnnual = billingCycle === 'annual';
        const monthlyPrice = isAnnual ? plan.price : plan.price;
        let totalAmount = isAnnual ? monthlyPrice * 12 : monthlyPrice;

        // Check for existing subscription and calculate pro-rated amount
        let currentSubscription = null;
        try {
            currentSubscription = await Subscription.findActiveByUser(userId);
        } catch (subError) {
            console.error('⚠️ Error fetching subscription (continuing without proration):', subError.message);
            // Continue without proration if subscription lookup fails
        }
        
        let prorationApplied = false;
        
        console.log('📊 Current subscription check:', {
            found: !!currentSubscription,
            planId: currentSubscription?.planId,
            price: currentSubscription?.price,
            startDate: currentSubscription?.startDate,
            endDate: currentSubscription?.endDate
        });
        
        if (currentSubscription && currentSubscription.planId !== 'basic') {
            // Calculate pro-rated amount for upgrade
            const prorationDetails = calculateProratedAmount(currentSubscription, plan, billingCycle);
            totalAmount = prorationDetails.proratedAmount;
            prorationApplied = true;
            
            console.log('🔄 Pro-ration applied:', {
                currentPlan: currentSubscription.planId,
                newPlan: planId,
                fullAmount: prorationDetails.fullAmount,
                unusedCredit: prorationDetails.unusedCredit,
                proratedAmount: prorationDetails.proratedAmount,
                daysRemaining: prorationDetails.daysRemaining,
                totalDays: prorationDetails.totalDays
            });
        } else {
            console.log('💰 Full amount (no proration):', {
                reason: currentSubscription ? 'Upgrading from Basic' : 'New subscription',
                amount: totalAmount
            });
        }

        // Ensure amount is at least ₹1 (Stripe minimum)
        if (totalAmount < 1) {
            console.warn('⚠️ Amount too low, setting to minimum ₹1');
            totalAmount = 1;
        }

        // Create Stripe checkout session
        const description = prorationApplied 
            ? `${plan.description} - ${isAnnual ? 'Annual' : 'Monthly'} billing (Pro-rated upgrade)` 
            : `${plan.description} - ${isAnnual ? 'Annual' : 'Monthly'} billing`;
        
        console.log('🔐 Creating Stripe session with:', {
            appUrl: process.env.NEXT_PUBLIC_APP_URL,
            planId,
            billingCycle,
            amount: totalAmount,
            prorationApplied
        });
            
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'link'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `${plan.displayName} Plan`,
                            description: description,
                        },
                        unit_amount: totalAmount * 100, // Stripe expects amount in paise
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pages/subscription?success=true&session_id={CHECKOUT_SESSION_ID}&plan=${planId}&billing=${billingCycle}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pages/subscription?canceled=true`,
            customer_email: userEmail,
            metadata: {
                userId,
                planId,
                billingCycle,
                prorationApplied: prorationApplied.toString(),
            },
        });

        console.log('✅ Stripe session created:', session.id);

        return NextResponse.json({
            success: true,
            sessionId: session.id,
            url: session.url,
        });

    } catch (error) {
        console.error('❌ Create checkout session error:', error);
        console.error('Error details:', {
            message: error.message,
            type: error.type,
            code: error.code,
            appUrl: process.env.NEXT_PUBLIC_APP_URL
        });
        return NextResponse.json({ 
            error: 'Failed to create checkout session',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
