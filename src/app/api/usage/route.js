import { NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth.middleware';
import { Subscription, Usage, PLANS } from '@/models/subscription.model';

const ACTION_FIELD_MAP = {
    pdf_report: 'pdfReportsGenerated',
    contract_compare: 'contractComparisons',
    contract_comparison: 'contractComparisons',
    voice_query: 'voiceQueries',
    document_analysis: 'documentsAnalyzed',
    ai_query: 'aiQueries',
    glossary_lookup: 'glossaryLookups'
};

const ensureSubscription = async (userId) => {
    let subscription = await Subscription.findActiveByUser(userId);
    if (!subscription) {
        const basicPlan = PLANS.basic;
        subscription = await Subscription.create({
            userId,
            planId: basicPlan.id,
            planName: basicPlan.name,
            status: "active",
            startDate: new Date(),
            endDate: null,
            price: basicPlan.price,
            currency: basicPlan.currency,
            features: basicPlan.features
        });
    }
    return subscription;
};

const getLimitForAction = (plan, action) => {
    if (!plan) return 0;
    if (action === 'pdf_report') {
        return plan.limits?.pdfReportsMonthly ?? (plan.features?.pdfReports ? -1 : 0);
    }
    if (action === 'contract_compare' || action === 'contract_comparison') {
        return plan.limits?.dailyContractComparisons ?? (plan.features?.contractComparison ? -1 : 0);
    }
    if (action === 'glossary_lookup') {
        return plan.limits?.dailyGlossaryLookups ?? 0;
    }
    if (action === 'document_analysis') {
        return plan.limits?.monthlyDocuments ?? (plan.features?.documentAnalysis ? -1 : 0);
    }
    if (action === 'ai_query') {
        return plan.limits?.dailyQueries ?? (plan.features?.aiQueries ?? 0);
    }
    return -1;
};

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
        const usageField = ACTION_FIELD_MAP[action];

        if (!usageField) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const subscription = await ensureSubscription(userId);
        const plan = PLANS[subscription.planId] || PLANS.basic;
        const currentUsage = await Usage.getCurrentMonthUsage(userId);
        const limit = getLimitForAction(plan, action);
        const todayKey = new Date().toISOString().slice(0, 10);
        const isContractCompare = action === 'contract_compare' || action === 'contract_comparison';
        const isGlossaryLookup = action === 'glossary_lookup';
        const used = isContractCompare
            ? (currentUsage.dailyContractComparisons?.[todayKey] || 0)
            : isGlossaryLookup
            ? (currentUsage.dailyGlossaryLookups?.[todayKey] || 0)
            : (currentUsage[usageField] || 0);

        if (limit !== -1 && used + amount > limit) {
            return NextResponse.json({
                success: false,
                error: 'Usage limit exceeded',
                limit,
                used,
                remaining: Math.max(limit - used, 0)
            }, { status: 403 });
        }

        let updatedUsage = currentUsage;
        if (isContractCompare) {
            await Usage.incrementUsage(userId, usageField, amount);
            updatedUsage = await Usage.incrementDailyUsage(userId, 'dailyContractComparisons', todayKey, amount);
        } else if (isGlossaryLookup) {
            await Usage.incrementUsage(userId, usageField, amount);
            updatedUsage = await Usage.incrementDailyUsage(userId, 'dailyGlossaryLookups', todayKey, amount);
        } else {
            updatedUsage = await Usage.incrementUsage(userId, usageField, amount);
        }

        return NextResponse.json({
            success: true,
            message: `Tracked ${action} usage for user ${userId}`,
            usage: updatedUsage,
            limit,
            remaining: limit === -1 ? -1 : Math.max(limit - (used + amount), 0),
            planId: plan.id
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
        const subscription = await ensureSubscription(userId);
        const plan = PLANS[subscription.planId] || PLANS.basic;
        const currentUsage = await Usage.getCurrentMonthUsage(userId);
        const usageHistory = await Usage.getUsageHistory(userId, 6);

        return NextResponse.json({
            success: true,
            currentUsage,
            usageHistory,
            limits: plan.limits || {},
            planDetails: plan
        });

    } catch (error) {
        console.error('Get usage error:', error);
        return NextResponse.json({ error: 'Failed to get usage' }, { status: 500 });
    }
}
