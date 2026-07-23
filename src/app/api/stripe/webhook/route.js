import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Subscription } from '@/models/subscription.model';
import { PLANS } from '@/constants/plans';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
    try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        let event;

        // Verify webhook signature
        if (webhookSecret) {
            try {
                event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
            } catch (err) {
                console.error('Webhook signature verification failed:', err.message);
                return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
            }
        } else {
            // For development without webhook secret
            event = JSON.parse(body);
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object);
                break;

            case 'payment_intent.succeeded':
                console.log('✅ Payment succeeded:', event.data.object.id);
                break;

            case 'payment_intent.payment_failed':
                console.log('❌ Payment failed:', event.data.object.id);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}

async function handleCheckoutSessionCompleted(session) {
    try {
        const { userId, planId, billingCycle } = session.metadata;
        const plan = PLANS[planId];

        if (!plan || !userId) {
            console.error('Invalid plan or userId in session metadata');
            return;
        }

        // Cancel existing active subscription
        const existingSubscription = await Subscription.findActiveByUser(userId);
        if (existingSubscription) {
            await Subscription.cancel(existingSubscription.id);
        }

        // Calculate dates
        const startDate = new Date();
        const isAnnual = billingCycle === 'annual';
        const endDate = new Date(Date.now() + (isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000);
        const totalAmount = isAnnual ? plan.price * 12 : plan.price;

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

        // Create new subscription in database
        await Subscription.create({
            userId,
            planId: plan.id,
            planName: plan.displayName,
            status: 'active',
            startDate,
            endDate,
            price: totalAmount,
            currency: plan.currency,
            paymentId: session.payment_intent || 'webhook',
            stripeCustomerId: session.customer || 'webhook',
            features,
        });

        console.log(`✅ Subscription created for user ${userId} - Plan: ${plan.displayName} (${billingCycle})`);
    } catch (error) {
        console.error('Error handling checkout session completed:', error);
    }
}
