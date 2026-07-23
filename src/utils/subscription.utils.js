/**
 * Subscription utility functions
 */

/**
 * Calculate pro-rated amount for plan upgrade
 * @param {Object} currentSubscription - Current active subscription
 * @param {Object} newPlan - New plan to upgrade to
 * @param {string} billingCycle - 'monthly' or 'annual'
 * @returns {Object} - { proratedAmount, daysRemaining, fullAmount }
 */
export function calculateProratedAmount(currentSubscription, newPlan, billingCycle) {
    const now = new Date();
    const endDate = new Date(currentSubscription.endDate);
    const startDate = new Date(currentSubscription.startDate);
    
    // Calculate days
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    const daysUsed = totalDays - daysRemaining;
    
    // Calculate amounts
    const isAnnual = billingCycle === 'annual';
    const newPlanAmount = isAnnual ? newPlan.price * 12 : newPlan.price;
    
    // Determine the total amount paid for current subscription
    // The price field should store the monthly price
    // If subscription period is ~365 days, multiply by 12 to get annual total
    const isCurrentAnnual = totalDays >= 350; // ~365 days with some tolerance
    const currentPlanTotalAmount = isCurrentAnnual ? currentSubscription.price * 12 : currentSubscription.price;
    
    // Calculate unused amount from current plan (pro-rated based on days remaining)
    const unusedAmount = (currentPlanTotalAmount / totalDays) * daysRemaining;
    
    // Calculate prorated amount (new plan - unused credit)
    const proratedAmount = Math.max(0, newPlanAmount - unusedAmount);
    
    console.log('💡 Proration calculation details:', {
        currentPrice: currentSubscription.price,
        isCurrentAnnual,
        currentPlanTotalAmount,
        totalDays,
        daysRemaining,
        unusedAmount,
        newPlanAmount,
        proratedAmount
    });
    
    return {
        proratedAmount: Math.round(proratedAmount),
        unusedCredit: Math.round(unusedAmount),
        fullAmount: newPlanAmount,
        daysRemaining,
        daysUsed,
        totalDays
    };
}

/**
 * Check if subscription is expired
 * @param {Object} subscription - Subscription object
 * @returns {boolean}
 */
export function isSubscriptionExpired(subscription) {
    if (!subscription || !subscription.endDate) return false;
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    return now > endDate;
}

/**
 * Get days until expiry
 * @param {Object} subscription - Subscription object
 * @returns {number} - Days remaining (negative if expired)
 */
export function getDaysUntilExpiry(subscription) {
    if (!subscription || !subscription.endDate) return Infinity;
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    return Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
}

/**
 * Format currency
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
}
