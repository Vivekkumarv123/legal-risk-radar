import { NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth.middleware';
import { Subscription, Usage, PLANS } from '@/models/subscription.model';

// Get user's subscription and usage
export async function GET(request) {
    try {
        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = authResult.user.uid;

        // Get user's active subscription from database
        let subscription = await Subscription.findActiveByUser(userId);
        
        // If no subscription exists, create default Basic plan
        if (!subscription) {
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
            
            subscription = await Subscription.create({
                userId,
                planId: basicPlan.id,
                planName: basicPlan.name,
                status: "active",
                startDate: new Date(),
                endDate: null, // Basic plan doesn't expire
                price: basicPlan.price,
                currency: basicPlan.currency,
                features
            });
        }

        // Get current month usage
        const usage = await Usage.getCurrentMonthUsage(userId);

        // Get plan details
        const planDetails = PLANS[subscription.planId] || PLANS.basic;

        return NextResponse.json({
            success: true,
            subscription,
            usage,
            planDetails,
            availablePlans: Object.values(PLANS)
        });

    } catch (error) {
        console.error('Get subscription error:', error);
        return NextResponse.json({ error: 'Failed to get subscription' }, { status: 500 });
    }
}

// Create or upgrade subscription
export async function POST(request) {
    try {
        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { planId, paymentData } = await request.json();

        if (!planId || !PLANS[planId]) {
            return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
        }

        const userId = authResult.user.uid;
        const plan = PLANS[planId];

        // Process payment (dummy implementation)
        const paymentResult = await processPayment(paymentData, plan.price);
        
        if (!paymentResult.success) {
            return NextResponse.json({ error: 'Payment failed' }, { status: 400 });
        }

        // Cancel existing active subscription
        const existingSubscription = await Subscription.findActiveByUser(userId);
        if (existingSubscription) {
            await Subscription.cancel(existingSubscription.id);
        }

        // Calculate dates
        const startDate = new Date();
        const endDate = plan.id === 'basic' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

        // Convert features
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
        const subscription = await Subscription.create({
            userId,
            planId: plan.id,
            planName: plan.name,
            status: "active",
            startDate,
            endDate,
            price: plan.price,
            currency: plan.currency,
            paymentId: paymentResult.paymentId,
            features
        });

        return NextResponse.json({
            success: true,
            subscription,
            message: `Successfully upgraded to ${plan.name} plan!`
        });

    } catch (error) {
        console.error('Create subscription error:', error);
        return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
    }
}

// Cancel subscription
export async function DELETE(request) {
    try {
        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = authResult.user.uid;

        // Find and cancel active subscription
        const activeSubscription = await Subscription.findActiveByUser(userId);
        if (activeSubscription) {
            await Subscription.cancel(activeSubscription.id);
            
            // Create new Basic plan subscription
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
                userId,
                planId: basicPlan.id,
                planName: basicPlan.name,
                status: "active",
                startDate: new Date(),
                endDate: null,
                price: basicPlan.price,
                currency: basicPlan.currency,
                features
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Subscription cancelled. Downgraded to Basic plan.'
        });

    } catch (error) {
        console.error('Cancel subscription error:', error);
        return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
    }
}

// Dummy payment processing function
async function processPayment(paymentData, amount) {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Dummy validation
    if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv) {
        return { success: false, error: 'Invalid payment data' };
    }

    // Simulate payment success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
        return {
            success: true,
            paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            amount,
            currency: 'INR',
            status: 'completed'
        };
    } else {
        return {
            success: false,
            error: 'Payment declined by bank'
        };
    }
}