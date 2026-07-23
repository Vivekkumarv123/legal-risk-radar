/**
 * Feature Display & User Messaging
 * Helper functions for displaying feature information in the UI
 */

import { getPlan, PLANS } from "@/constants/plans";
import { hasFeature, getFeature, getFeatureLimit } from "@/utils/subscriptionUtils";

/**
 * Get feature lock message for a feature
 */
export const getFeatureLockMessage = (featureName, currentPlanId = "basic") => {
  const feature = getFeature(currentPlanId, featureName);

  if (!feature || !feature.enabled) {
    // Find which plan first has this feature
    let firstAvailablePlan = null;
    for (const [planId, plan] of Object.entries(PLANS)) {
      if (plan.features[featureName]?.enabled) {
        firstAvailablePlan = planId;
        break;
      }
    }

    if (firstAvailablePlan) {
      const targetPlan = getPlan(firstAvailablePlan);
      return {
        locked: true,
        message: `Unlock with ${targetPlan.displayName} plan`,
        feature: featureName,
        requiredPlan: firstAvailablePlan,
        planPrice: targetPlan.price,
      };
    }

    return {
      locked: true,
      message: "Feature unavailable",
      feature: featureName,
    };
  }

  return {
    locked: false,
    message: "Available",
  };
};

/**
 * Get limit message for display
 */
export const getLimitMessage = (featureName, currentPlanId, usageCount = 0) => {
  const limit = getFeatureLimit(currentPlanId, featureName);

  if (limit === -1) {
    return "Unlimited";
  }

  if (limit === 0) {
    return "Not available";
  }

  const remaining = Math.max(0, limit - usageCount);
  return `${remaining}/${limit} remaining`;
};

/**
 * Get feature description with limit info
 */
export const getFeatureDisplayText = (featureName, currentPlanId) => {
  const feature = getFeature(currentPlanId, featureName);

  if (!feature.enabled) {
    return null;
  }

  let text = feature.description || featureName;

  if (feature.limit !== undefined && feature.limit !== null) {
    if (feature.limit === -1) {
      text += " (Unlimited)";
    } else if (feature.limit > 0) {
      text += ` (${feature.limit}/${feature.limitType || "month"})`;
    }
  }

  return text;
};

/**
 * Get upgrade suggestion for feature
 */
export const getUpgradeSuggestion = (
  featureName,
  currentPlanId = "basic"
) => {
  // Find the first plan that has this feature
  for (const plan of [PLANS.pro, PLANS.enterprise]) {
    if (plan.features[featureName]?.enabled) {
      return {
        planName: plan.displayName,
        planId: plan.id,
        price: plan.price,
        feature: featureName,
        message: `Upgrade to ${plan.displayName} (₹${plan.price}/month) to unlock ${featureName}`,
      };
    }
  }

  return null;
};

/**
 * Get feature tier info - which plans have this feature
 */
export const getFeatureTers = (featureName) => {
  const tiers = {
    basic: false,
    pro: false,
    enterprise: false,
  };

  Object.entries(PLANS).forEach(([planId, plan]) => {
    if (plan.features[featureName]?.enabled) {
      tiers[planId] = true;
    }
  });

  return tiers;
};

/**
 * Create an upgrade badge/pill for locked features
 */
export const upgradeRequiredBadge = (featureName, currentPlanId = "basic") => {
  const suggestion = getUpgradeSuggestion(featureName, currentPlanId);

  if (!suggestion) {
    return null;
  }

  return {
    text: `Upgrade to ${suggestion.planName}`,
    plan: suggestion.planId,
    price: suggestion.price,
    color: suggestion.planId === "pro" ? "blue" : "purple",
  };
};

/**
 * Format feature list for display (with limits and availability)
 */
export const formatFeatureList = (planId) => {
  const plan = getPlan(planId);
  if (!plan) return [];

  return Object.entries(plan.features)
    .filter(([_, feature]) => feature.enabled && feature.description)
    .map(([featureName, feature]) => ({
      name: featureName,
      description: feature.description,
      limit: feature.limit,
      limitType: feature.limitType,
      displayText: getFeatureDisplayText(featureName, planId),
    }));
};

/**
 * Get plan comparison for feature (human readable)
 */
export const compareFeaturePlans = (featureName) => {
  return {
    basic: getFeatureDisplayText(featureName, "basic"),
    pro: getFeatureDisplayText(featureName, "pro"),
    enterprise: getFeatureDisplayText(featureName, "enterprise"),
  };
};

/**
 * Generate upgrade CTA text
 */
export const getUpgradeCTA = (currentPlanId = "basic") => {
  const currentPlan = getPlan(currentPlanId);

  if (currentPlanId === "enterprise") {
    return "You have our best plan!";
  }

  if (currentPlanId === "pro") {
    return {
      text: "Unlock unlimited with Enterprise",
      plan: "enterprise",
      price: PLANS.enterprise.price,
    };
  }

  // Basic plan
  return {
    text: "Upgrade to Pro for unlimited features",
    plan: "pro",
    price: PLANS.pro.price,
  };
};

/**
 * Feature availability summary
 */
export const getAvailabilitySummary = (featureName) => {
  const availability = getFeatureTers(featureName);

  let summary = "Available in: ";
  const available = Object.entries(availability)
    .filter(([_, isAvailable]) => isAvailable)
    .map(([plan, _]) => getPlan(plan).displayName);

  if (available.length === 0) {
    return "Not available in any plan";
  }

  return summary + available.join(" and ");
};

/**
 * Feature status badge for UI
 */
export const getFeatureStatusBadge = (featureName, currentPlanId) => {
  if (hasFeature(currentPlanId, featureName)) {
    return {
      status: "included",
      badge: "✓",
      color: "green",
      text: "Included in your plan",
    };
  }

  const suggestion = getUpgradeSuggestion(featureName, currentPlanId);

  if (suggestion) {
    return {
      status: "locked",
      badge: "🔒",
      color: "orange",
      text: `Upgrade to ${suggestion.planName}`,
      action: {
        label: `Upgrade - ₹${suggestion.price}/mo`,
        planId: suggestion.planId,
      },
    };
  }

  return {
    status: "unavailable",
    badge: "✗",
    color: "gray",
    text: "Not available",
  };
};
