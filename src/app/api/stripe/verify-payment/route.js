import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifyToken } from '@/middleware/auth.middleware';
import { Subscription } from '@/models/subscription.model';
import { PLANS } from '@/constants/plans';
import { calculateProratedAmount } from '@/utils/subscription.utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sessionId, planId, billingCycle } = await request.json();

        if (!sessionId || !planId || !billingCycle) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const userId = authResult.user.uid;
        const plan = PLANS[planId];

        if (!plan) {
            return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
        }

        // Retrieve the session from Stripe to verify payment
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
        }

        // Check if subscription already exists
        const existingSubscription = await Subscription.findActiveByUser(userId);
        if (existingSubscription && existingSubscription.planId === planId) {
            return NextResponse.json({
                success: true,
                message: 'Subscription already active',
                subscription: existingSubscription
            });
        }

        // Cancel existing subscription if different plan
        if (existingSubscription) {
            await Subscription.cancel(existingSubscription.id);
        }

        // Calculate dates
        const startDate = new Date();
        const isAnnual = billingCycle === 'annual';
        const endDate = new Date(Date.now() + (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000);
        
        // Store the monthly price in the subscription (not the total amount)
        // This is needed for proration calculations
        const monthlyPrice = plan.price;

        // Convert features from PLANS format to subscription model format
        const features = {
            aiQueries: plan.limits?.dailyQueries || -1,
            documentAnalysis: plan.features?.documentAnalysis?.enabled || false,
            voiceQueries: plan.features?.voiceQueries?.enabled || false,
            pdfReports: plan.features?.pdfReports?.enabled || false,
            prioritySupport: plan.features?.prioritySupport?.enabled || false,
            apiAccess: false,
            teamCollaboration: 0,
            contractComparison: plan.features?.contractComparison?.enabled || false,
            chromeExtension: plan.features?.chromeExtension?.enabled || false,
            newsletter: false,
        };

        // Create new subscription
        const subscription = await Subscription.create({
            userId,
            planId: plan.id,
            planName: plan.displayName,
            status: 'active',
            startDate,
            endDate,
            price: monthlyPrice, // Store monthly price for proration calculations
            currency: plan.currency,
            paymentId: session.payment_intent || 'manual',
            stripeCustomerId: session.customer || 'manual',
            features,
        });

        console.log(`✅ Subscription verified and created for user ${userId} - Plan: ${plan.displayName} (${billingCycle})`);

        return NextResponse.json({
            success: true,
            message: 'Subscription activated successfully',
            subscription
        });

    } catch (error) {
        console.error('Verify payment error:', error);
        return NextResponse.json({ 
            error: 'Failed to verify payment',
            details: error.message 
        }, { status: 500 });
    }
}
