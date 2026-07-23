/**
 * Subscription Feature Access & Validation Utilities
 * Use these utilities throughout the app to check feature access
 */

import { getPlan, PLAN_TIERS } from "@/constants/plans";

/**
 * Check if a user has access to a specific feature
 * @param {string|object} subscription - Plan ID or subscription object
 * @param {string} featureName - Name of the feature to check
 * @returns {boolean} - Whether feature is enabled
 */
export const hasFeature = (subscription, featureName) => {
  if (!subscription) return false;

  // If subscription is a string (plan ID)
  let planId = subscription;
  if (typeof subscription === "object") {
    planId = subscription.planId || subscription.plan;
  }

  const plan = getPlan(planId);
  if (!plan) return false;

  const feature = plan.features[featureName];
  return feature?.enabled === true;
};

/**
 * Get feature details from a plan
 * @param {string} planId - Plan ID
 * @param {string} featureName - Feature name
 * @returns {object} - Feature object with enabled, limit, description
 */
export const getFeature = (planId, featureName) => {
  const plan = getPlan(planId);
  if (!plan) return { enabled: false };
  return plan.features[featureName] || { enabled: false };
};

/**
 * Get feature limit for a plan
 * @param {string|object} subscription - Plan ID or subscription object
 * @param {string} featureName - Feature name
 * @returns {number|null} - Limit value (-1 = unlimited, 0 = disabled, >0 = specific limit)
 */
export const getFeatureLimit = (subscription, featureName) => {
  if (!subscription) return 0;

  let planId = subscription;
  if (typeof subscription === "object") {
    planId = subscription.planId || subscription.plan;
  }

  const feature = getFeature(planId, featureName);
  return feature.limit !== undefined ? feature.limit : 0;
};

/**
 * Check if a feature has unlimited access
 * @param {string|object} subscription - Plan ID or subscription object
 * @param {string} featureName - Feature name
 * @returns {boolean} - Whether feature is unlimited
 */
export const isFeatureUnlimited = (subscription, featureName) => {
  const limit = getFeatureLimit(subscription, featureName);
  return limit === -1;
};

/**
 * Validate if usage is within limits
 * @param {string|object} subscription - Plan ID or subscription object
 * @param {string} featureName - Feature name
 * @param {number} currentUsage - Current usage count
 * @returns {object} - { allowed: boolean, remaining: number, limit: number }
 */
export const checkUsageLimit = (subscription, featureName, currentUsage = 0) => {
  const limit = getFeatureLimit(subscription, featureName);

  // Unlimited
  if (limit === -1) {
    return {
      allowed: true,
      remaining: Infinity,
      limit: -1,
      unlimited: true,
    };
  }

  // Disabled
  if (limit === 0) {
    return {
      allowed: false,
      remaining: 0,
      limit: 0,
      reason: "Feature not available in this plan",
    };
  }

  // Limited
  const remaining = Math.max(0, limit - currentUsage);
  return {
    allowed: remaining > 0,
    remaining,
    limit,
    unlimited: false,
  };
};

/**
 * Get all enabled features for a plan
 * @param {string} planId - Plan ID
 * @returns {array} - Array of feature names that are enabled
 */
export const getEnabledFeatures = (planId) => {
  const plan = getPlan(planId);
  if (!plan) return [];

  return Object.entries(plan.features)
    .filter(([_, feature]) => feature.enabled === true)
    .map(([name, _]) => name);
};

/**
 * Get feature description for display
 * @param {string} planId - Plan ID
 * @param {string} featureName - Feature name
 * @returns {string} - Feature description
 */
export const getFeatureDescription = (planId, featureName) => {
  const feature = getFeature(planId, featureName);
  return feature.description || featureName;
};

/**
 * Compare features across plans
 * @param {string} featureName - Feature name
 * @returns {object} - Feature comparison across all plans
 */
export const compareFeatureAcrossPlan = (featureName) => {
  const result = {};

  Object.keys(PLAN_TIERS).forEach((tierKey) => {
    const tierId = PLAN_TIERS[tierKey];
    result[tierId] = getFeature(tierId, featureName);
  });

  return result;
};

/**
 * Get pricing tier display data
 * Useful for pricing page
 */
export const getPricingTierList = () => {
  return Object.values(PLAN_TIERS).map((planId) => {
    const plan = getPlan(planId);
    return {
      id: plan.id,
      name: plan.displayName,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      popular: plan.popular,
      tagline: plan.tagline,
      features: Object.entries(plan.features)
        .filter(([_, f]) => f.enabled)
        .map(([name, feature]) => ({
          name,
          description: feature.description,
          limit: feature.limit,
          limitType: feature.limitType,
        })),
    };
  });
};
