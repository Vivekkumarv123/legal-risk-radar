import { Subscription, Usage, PLANS } from '@/models/subscription.model';

/**
 * Check if user can perform an action based on their subscription plan
 */
export async function checkUsageLimit(userId, action, amount = 1) {
    try {
        // Get user's subscription and usage info from database
        const subscription = await Subscription.findActiveByUser(userId);
        const usage = await Usage.getCurrentMonthUsage(userId);
        
        if (!subscription) {
            return {
                allowed: false,
                message: 'No active subscription found',
                upgradeRequired: true
            };
        }

        const plan = PLANS[subscription.planId] || PLANS.basic;

        // Check specific action limits
        switch (action) {
            case 'ai_query':
                const dailyLimit = plan.features.aiQueries;
                if (dailyLimit === -1) {
                    return { allowed: true, message: 'Unlimited queries' };
                }
                
                const currentUsage = usage.aiQueries || 0;
                if (currentUsage >= dailyLimit) {
                    return {
                        allowed: false,
                        message: `Daily limit of ${dailyLimit} AI queries reached`,
                        upgradeRequired: true,
                        currentUsage,
                        limit: dailyLimit,
                        limitType: 'ai_query'
                    };
                }
                break;

            case 'document_analysis':
                if (!plan.features.documentAnalysis) {
                    return {
                        allowed: false,
                        message: 'Document analysis not available in your plan',
                        upgradeRequired: true,
                        limitType: 'document_analysis'
                    };
                }
                break;

            case 'voice_query':
                if (!plan.features.voiceQueries) {
                    return {
                        allowed: false,
                        message: 'Voice queries not available in your plan',
                        upgradeRequired: true,
                        limitType: 'voice_query'
                    };
                }
                break;

            case 'pdf_report':
                if (!plan.features.pdfReports) {
                    return {
                        allowed: false,
                        message: 'PDF reports not available in your plan',
                        upgradeRequired: true,
                        limitType: 'pdf_report'
                    };
                }
                break;

            case 'contract_comparison':
                if (!plan.features.contractComparison) {
                    return {
                        allowed: false,
                        message: 'Contract comparison not available in your plan',
                        upgradeRequired: true,
                        limitType: 'contract_comparison'
                    };
                }
                break;

            default:
                return { allowed: true, message: 'Action allowed' };
        }

        return {
            allowed: true,
            message: 'Action allowed',
            currentUsage: usage[action] || 0,
            limit: plan.features.aiQueries
        };

    } catch (error) {
        console.error('Usage check error:', error);
        return {
            allowed: false,
            message: 'Unable to verify usage limits. Please try again.',
            error: error.message
        };
    }
}

/**
 * Track usage after successful action
 */
export async function trackUsage(userId, action, amount = 1) {
    try {
        // Map action to database field
        const fieldMap = {
            'ai_query': 'aiQueries',
            'document_analysis': 'documentsAnalyzed',
            'voice_query': 'voiceQueries',
            'pdf_report': 'pdfReportsGenerated',
            'contract_comparison': 'contractComparisons'
        };

        const field = fieldMap[action];
        if (!field) {
            return { success: true };
        }

        // Increment usage in database
        const updatedUsage = await Usage.incrementUsage(userId, field, amount);
        
        return {
            success: true,
            userId,
            action,
            amount,
            updatedUsage,
            timestamp: new Date()
        };

    } catch (error) {
        console.error('Usage tracking error:', error);
        // Don't throw error - tracking failure shouldn't break the main action
        return { success: false, error: error.message };
    }
}

/**
 * Get user's current usage and limits based on their subscription
 */
export async function getUserUsageInfo(userId) {
    try {
        // Get real data from database
        const subscription = await Subscription.findActiveByUser(userId);
        const usage = await Usage.getCurrentMonthUsage(userId);
        
        if (!subscription) {
            return null;
        }

        const plan = PLANS[subscription.planId] || PLANS.basic;

        return {
            subscription: {
                planId: subscription.planId,
                planName: subscription.planName,
                status: subscription.status
            },
            usage: {
                aiQueries: usage.aiQueries || 0,
                documentsAnalyzed: usage.documentsAnalyzed || 0,
                voiceQueries: usage.voiceQueries || 0,
                pdfReportsGenerated: usage.pdfReportsGenerated || 0,
                contractComparisons: usage.contractComparisons || 0
            },
            plan: {
                id: plan.id,
                name: plan.name,
                features: plan.features
            },
            limits: plan.limits || {
                dailyQueries: plan.features.aiQueries,
                monthlyDocuments: plan.features.documentAnalysis ? 50 : 0
            }
        };

    } catch (error) {
        console.error('Get usage info error:', error);
        return null;
    }
}