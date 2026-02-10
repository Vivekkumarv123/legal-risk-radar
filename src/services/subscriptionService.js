/**
 * Subscription Service
 * Main business logic for handling subscriptions and feature access
 */

import { Subscription, Usage } from "@/models/subscription.model";
import { getPlan } from "@/constants/plans";
import {
  getFeatureLimit,
  hasFeature,
  isFeatureUnlimited,
  checkUsageLimit,
} from "@/utils/subscriptionUtils";

/**
 * Get user's subscription status
 */
export const getUserSubscription = async (userId) => {
  if (!userId) throw new Error("User ID is required");

  const subscription = await Subscription.findActiveByUser(userId);

  if (!subscription) {
    // User has no active subscription, return default Basic plan
    return {
      id: null,
      userId,
      planId: "basic",
      planName: "Basic",
      status: "active",
      isDefault: true,
      features: getPlan("basic").features,
      limits: getPlan("basic").limits,
    };
  }

  return subscription;
};

/**
 * Upgrade user to a new plan
 */
export const upgradeSubscription = async (
  userId,
  newPlanId,
  paymentDetails = {}
) => {
  if (!userId || !newPlanId) {
    throw new Error("User ID and Plan ID are required");
  }

  const plan = getPlan(newPlanId);
  if (!plan) {
    throw new Error(`Invalid plan ID: ${newPlanId}`);
  }

  // Cancel existing subscription
  const existing = await Subscription.findActiveByUser(userId);
  if (existing) {
    await Subscription.cancel(existing.id);
  }

  // Create new subscription
  const now = new Date();
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const subscriptionData = {
    userId,
    planId: newPlanId,
    planName: plan.name,
    status: "active",
    startDate: now,
    endDate,
    price: plan.price,
    currency: plan.currency,
    paymentId: paymentDetails.paymentId || null,
    features: plan.features,
  };

  return await Subscription.create(subscriptionData);
};

/**
 * Downgrade subscription (can also be used for plan change)
 */
export const changeSubscriptionPlan = async (userId, newPlanId) => {
  return upgradeSubscription(userId, newPlanId);
};

/**
 * Check if user can perform an action based on plan
 */
export const canPerformAction = async (
  userId,
  featureName,
  currentUsage = 0
) => {
  const subscription = await getUserSubscription(userId);

  // Check if feature is available
  if (!hasFeature(subscription.planId, featureName)) {
    return {
      allowed: false,
      reason: `Feature "${featureName}" is not available in your plan`,
      upgradeRequired: true,
    };
  }

  // Check usage limits
  const usageCheck = checkUsageLimit(
    subscription.planId,
    featureName,
    currentUsage
  );

  if (!usageCheck.allowed) {
    return {
      allowed: false,
      reason: `You have reached the limit for ${featureName}`,
      limit: usageCheck.limit,
      remaining: usageCheck.remaining,
      upgradeRequired: true,
    };
  }

  return {
    allowed: true,
    remaining: usageCheck.remaining,
    limit: usageCheck.limit,
    unlimited: usageCheck.unlimited,
  };
};

/**
 * Check daily usage limit
 */
export const checkDailyLimit = async (userId, featureName, dayKey) => {
  const subscription = await getUserSubscription(userId);
  const usage = await Usage.getCurrentMonthUsage(userId);

  const dailyField = `daily${featureName.charAt(0).toUpperCase() + featureName.slice(1)}`;
  const currentDaily = (usage[dailyField] && usage[dailyField][dayKey]) || 0;

  return canPerformAction(userId, featureName, currentDaily);
};

/**
 * Check monthly usage limit
 */
export const checkMonthlyLimit = async (userId, featureName) => {
  const subscription = await getUserSubscription(userId);
  const usage = await Usage.getCurrentMonthUsage(userId);

  const currentUsage = usage[featureName] || 0;

  return canPerformAction(userId, featureName, currentUsage);
};

/**
 * Record usage and check limits
 */
export const recordUsage = async (userId, featureName, isDaily = true) => {
  const canDo = isDaily
    ? await checkDailyLimit(userId, featureName, getTodayKey())
    : await checkMonthlyLimit(userId, featureName);

  if (!canDo.allowed) {
    throw new Error(canDo.reason);
  }

  // Record the usage
  if (isDaily) {
    await Usage.incrementDailyUsage(
      userId,
      `daily${featureName.charAt(0).toUpperCase() + featureName.slice(1)}`,
      getTodayKey(),
      1
    );
  } else {
    await Usage.incrementUsage(userId, featureName, 1);
  }

  // Return remaining usage
  const updatedUsage = await Usage.getCurrentMonthUsage(userId);
  const field = isDaily
    ? `daily${featureName.charAt(0).toUpperCase() + featureName.slice(1)}`
    : featureName;

  return {
    success: true,
    remaining: canDo.remaining - 1,
    limit: canDo.limit,
  };
};

/**
 * Get user's plan comparison data (for display)
 */
export const getUserPlanComparison = async (userId) => {
  const subscription = await getUserSubscription(userId);
  const plan = getPlan(subscription.planId);

  return {
    currentPlan: {
      id: subscription.planId,
      name: plan.name,
      price: plan.price,
    },
    features: plan.features,
    limits: plan.limits,
  };
};

/**
 * Get analytics for subscription (usage vs limits)
 */
export const getSubscriptionAnalytics = async (userId) => {
  const subscription = await getUserSubscription(userId);
  const usage = await Usage.getCurrentMonthUsage(userId);
  const plan = getPlan(subscription.planId);

  const analytics = {
    plan: subscription.planId,
    usage: {},
    limits: plan.limits,
  };

  // Calculate usage percentages
  Object.entries(plan.limits).forEach(([limitName, limitValue]) => {
    const usageKey = limitName.replace("daily", "").toLowerCase();
    const currentUsage = usage[usageKey] || 0;

    analytics.usage[limitName] = {
      used: currentUsage,
      limit: limitValue,
      percentage:
        limitValue === -1
          ? 0
          : Math.round((currentUsage / limitValue) * 100),
      unlimited: limitValue === -1,
    };
  });

  return analytics;
};

/**
 * Validate subscription is still active
 */
export const isSubscriptionActive = async (userId) => {
  const subscription = await getUserSubscription(userId);

  if (subscription.isDefault) return true; // Basic plan is always active

  if (subscription.status !== "active") return false;

  if (subscription.endDate) {
    const now = new Date();
    const endDate = subscription.endDate.toDate
      ? subscription.endDate.toDate()
      : new Date(subscription.endDate);
    if (now > endDate) return false;
  }

  return true;
};

/**
 * Get today's date key for daily tracking (YYYY-MM-DD)
 */
const getTodayKey = () => new Date().toISOString().split("T")[0];

/**
 * Renew subscription (when payment is completed)
 */
export const renewSubscription = async (userId, planId, paymentId) => {
  const existing = await Subscription.findActiveByUser(userId);

  if (existing) {
    const plan = getPlan(planId);
    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await Subscription.update(existing.id, {
      status: "active",
      startDate: now,
      endDate,
      paymentId,
      updatedAt: now,
    });
  } else {
    await upgradeSubscription(userId, planId, { paymentId });
  }
};

export default {
  getUserSubscription,
  upgradeSubscription,
  changeSubscriptionPlan,
  canPerformAction,
  checkDailyLimit,
  checkMonthlyLimit,
  recordUsage,
  getUserPlanComparison,
  getSubscriptionAnalytics,
  isSubscriptionActive,
  renewSubscription,
};
