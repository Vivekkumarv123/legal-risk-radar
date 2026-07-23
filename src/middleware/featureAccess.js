/**
 * Feature Access Middleware
 * Protect API endpoints based on subscription plan
 */

import { getUserSubscription, canPerformAction } from "@/services/subscriptionService";

/**
 * Middleware to check if user has access to a feature
 * Usage: await checkFeatureAccess(userId, 'aiLegalQueries')
 */
export const checkFeatureAccess = async (userId, featureName, currentUsage = 0) => {
  if (!userId) {
    return {
      allowed: false,
      error: "User ID is required",
      code: "UNAUTHORIZED",
    };
  }

  try {
    const result = await canPerformAction(userId, featureName, currentUsage);
    return result;
  } catch (error) {
    return {
      allowed: false,
      error: error.message,
      code: "ERROR",
    };
  }
};

/**
 * API Route Wrapper - Validates feature access
 * Usage:
 * export const POST = withFeatureCheck('aiLegalQueries', async (req, context, userId) => {
 *   // Your handler code
 * });
 */
export const withFeatureCheck = (featureName, handler) => {
  return async (req, context) => {
    try {
      // Get user ID from auth context or request
      const userId = req.headers.get("x-user-id") || context.params?.userId;

      if (!userId) {
        return Response.json(
          { error: "Unauthorized", code: "NO_USER_ID" },
          { status: 401 }
        );
      }

      // Check feature access
      const access = await checkFeatureAccess(userId, featureName);

      if (!access.allowed) {
        return Response.json(
          {
            error: access.error || access.reason,
            code: "FEATURE_NOT_AVAILABLE",
            upgradeRequired: access.upgradeRequired,
          },
          { status: 403 }
        );
      }

      // Feature is accessible, continue with handler
      return handler(req, context, userId, access);
    } catch (error) {
      console.error(`Feature check error for ${featureName}:`, error);
      return Response.json(
        { error: "Internal server error", code: "ERROR" },
        { status: 500 }
      );
    }
  };
};

/**
 * Check subscription status middleware
 * Validates user has active subscription
 */
export const withSubscriptionCheck = (handler) => {
  return async (req, context) => {
    try {
      const userId = req.headers.get("x-user-id") || context.params?.userId;

      if (!userId) {
        return Response.json(
          { error: "Unauthorized", code: "NO_USER_ID" },
          { status: 401 }
        );
      }

      const subscription = await getUserSubscription(userId);

      if (!subscription) {
        return Response.json(
          { error: "No subscription found", code: "NO_SUBSCRIPTION" },
          { status: 403 }
        );
      }

      // Pass subscription to handler
      return handler(req, context, userId, subscription);
    } catch (error) {
      console.error("Subscription check error:", error);
      return Response.json(
        { error: "Internal server error", code: "ERROR" },
        { status: 500 }
      );
    }
  };
};

/**
 * Helper to create feature-gated API response
 */
export const featureGatedResponse = (allowed, message, data = null) => {
  return {
    allowed,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Batch feature check for multiple features
 */
export const checkMultipleFeatures = async (userId, features) => {
  const results = {};

  for (const feature of features) {
    const access = await checkFeatureAccess(userId, feature);
    results[feature] = access;
  }

  return results;
};

export default {
  checkFeatureAccess,
  withFeatureCheck,
  withSubscriptionCheck,
  featureGatedResponse,
  checkMultipleFeatures,
};
