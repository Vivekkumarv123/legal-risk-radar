/**
 * Subscription Plans & Features Definition
 * Central source of truth for all subscription tiers and their capabilities
 */

export const PLAN_TIERS = {
  BASIC: "basic",
  PRO: "pro",
  ENTERPRISE: "enterprise",
};

export const PLANS = {
  basic: {
    id: "basic",
    name: "Basic",
    displayName: "Basic",
    description: "Essential legal guidance for individuals",
    price: 0,
    currency: "INR",
    interval: "month",
    popular: false,
    tagline: "Get started with free legal guidance",
    features: {
      aiLegalQueries: {
        enabled: true,
        limit: 5,
        limitType: "daily",
        description: "5 AI Legal Queries / day",
      },
      documentAnalysis: {
        enabled: true,
        limit: null,
        description: "Basic Document Analysis",
      },
      ipcCrpcContext: {
        enabled: true,
        description: "Access to IPC/CrPC Context",
      },
      communitySupport: {
        enabled: true,
        description: "Community Support",
      },
      chatHistoryStorage: {
        enabled: true,
        description: "Chat History Storage",
      },
      contractComparison: {
        enabled: true,
        limit: 1,
        limitType: "daily",
        description: "1 Contract Comparison / day",
      },
      glossaryLookups: {
        enabled: true,
        limit: 10,
        limitType: "daily",
        description: "10 Glossary Lookups / day",
      },
      documentUploadOcr: { enabled: false, description: "Document Upload & OCR Analysis" },
      voiceQueries: { enabled: false, description: "Voice-to-Text Queries" },
      voiceLanguages: { enabled: false, description: "Voice-to-Text Queries (12+ Languages)" },
      pdfReports: { enabled: false, limit: 0, description: "PDF Reports" },
      unlimitedContractComparisons: { enabled: false, description: "Unlimited Contract Comparisons" },
      chromeExtension: { enabled: false, description: "Chrome Extension Access" },
      autoHighlightGlossary: { enabled: false, description: "Unlimited Glossary Lookups + Auto-Highlight" },
      chatSharing: { enabled: false, description: "Chat Sharing with Public URLs" },
      prioritySupport: { enabled: false, description: "Priority Email Support" },
      advancedAnalytics: { enabled: false, description: "Advanced Analytics Dashboard" },
      customGlossaryPacks: { enabled: false, description: "Custom Glossary Packs (Team)" },
      newsletterInsights: { enabled: false, description: "Newsletter Insights (Enterprise)" },
      dedicatedAccountManager: { enabled: false, description: "Dedicated Account Manager" },
    },
    limits: {
      dailyQueries: 5,
      monthlyDocuments: 0,
      pdfReportsMonthly: 0,
      dailyContractComparisons: 1,
      dailyGlossaryLookups: 10,
    },
  },

  pro: {
    id: "pro",
    name: "Pro",
    displayName: "Pro Advisor",
    description: "For freelancers and proactive professionals",
    price: 499,
    currency: "INR",
    interval: "month",
    popular: true,
    tagline: "Unlimited queries & advanced features",
    features: {
      aiLegalQueries: {
        enabled: true,
        limit: -1,
        limitType: "unlimited",
        description: "Unlimited AI Legal Chat",
      },
      documentAnalysis: {
        enabled: true,
        limit: -1,
        description: "Unlimited Document Analysis",
      },
      documentUploadOcr: {
        enabled: true,
        description: "Document Upload & OCR Analysis",
      },
      voiceQueries: {
        enabled: true,
        description: "Voice-to-Text Queries",
      },
      voiceLanguages: {
        enabled: true,
        limit: 12,
        description: "Voice-to-Text Queries (12+ Languages)",
      },
      pdfReports: {
        enabled: true,
        limit: 20,
        limitType: "monthly",
        description: "20 PDF Reports / month",
      },
      unlimitedContractComparisons: {
        enabled: true,
        limit: -1,
        description: "Unlimited Contract Comparisons",
      },
      contractComparison: {
        enabled: true,
        limit: -1,
      },
      chromeExtension: {
        enabled: true,
        description: "Chrome Extension Access",
      },
      autoHighlightGlossary: {
        enabled: true,
        description: "Unlimited Glossary Lookups + Auto-Highlight",
      },
      glossaryLookups: {
        enabled: true,
        limit: -1,
      },
      chatSharing: {
        enabled: true,
        description: "Chat Sharing with Public URLs",
      },
      prioritySupport: {
        enabled: true,
        description: "Priority Email Support",
      },
      ipcCrpcContext: { enabled: true, description: "Access to IPC/CrPC Context" },
      communitySupport: { enabled: true, description: "Community Support" },
      chatHistoryStorage: { enabled: true, description: "Chat History Storage" },
      advancedAnalytics: { enabled: false, description: "Advanced Analytics Dashboard" },
      customGlossaryPacks: { enabled: false, description: "Custom Glossary Packs (Team)" },
      newsletterInsights: { enabled: false, description: "Newsletter Insights (Enterprise)" },
      dedicatedAccountManager: { enabled: false, description: "Dedicated Account Manager" },
    },
    limits: {
      dailyQueries: -1,
      monthlyDocuments: 50,
      pdfReportsMonthly: 20,
      dailyContractComparisons: -1,
      dailyGlossaryLookups: -1,
    },
  },

  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    displayName: "Enterprise",
    description: "For small firms and legal teams",
    price: 2499,
    currency: "INR",
    interval: "month",
    popular: false,
    tagline: "Everything for your legal team",
    features: {
      aiLegalQueries: {
        enabled: true,
        limit: -1,
        limitType: "unlimited",
        description: "Unlimited AI Legal Chat",
      },
      documentAnalysis: {
        enabled: true,
        limit: -1,
        description: "Unlimited Document Analysis",
      },
      documentUploadOcr: {
        enabled: true,
        description: "Document Upload & OCR Analysis",
      },
      voiceQueries: {
        enabled: true,
        description: "Voice-to-Text Queries",
      },
      voiceLanguages: {
        enabled: true,
        limit: 12,
        description: "Voice-to-Text Queries (12+ Languages)",
      },
      pdfReports: {
        enabled: true,
        limit: -1,
        description: "Unlimited PDF Reports",
      },
      unlimitedContractComparisons: {
        enabled: true,
        description: "Unlimited Contract Comparisons",
      },
      contractComparison: {
        enabled: true,
        limit: -1,
      },
      chromeExtension: {
        enabled: true,
        description: "Chrome Extension Access",
      },
      customGlossaryPacks: {
        enabled: true,
        description: "Custom Glossary Packs (Team)",
      },
      glossaryLookups: {
        enabled: true,
        limit: -1,
      },
      newsletterInsights: {
        enabled: true,
        description: "Newsletter Insights (Enterprise)",
      },
      chatSharing: {
        enabled: true,
        description: "Chat Sharing with Public URLs",
      },
      prioritySupport: {
        enabled: true,
        description: "Priority Email Support",
      },
      advancedAnalytics: {
        enabled: true,
        description: "Advanced Analytics Dashboard",
      },
      dedicatedAccountManager: {
        enabled: true,
        description: "Dedicated Account Manager",
      },
      ipcCrpcContext: { enabled: true, description: "Access to IPC/CrPC Context" },
      communitySupport: { enabled: true, description: "Community Support" },
      chatHistoryStorage: { enabled: true, description: "Chat History Storage" },
      autoHighlightGlossary: { enabled: true, description: "Unlimited Glossary Lookups + Auto-Highlight" },
    },
    limits: {
      dailyQueries: -1, // Unlimited
      monthlyDocuments: -1, // Unlimited
      pdfReportsMonthly: -1, // Unlimited
      dailyContractComparisons: -1,
      dailyGlossaryLookups: -1,
    },
  },
};

/**
 * Get all plan IDs
 */
export const getPlanIds = () => Object.keys(PLANS);

/**
 * Get a specific plan by ID
 */
export const getPlan = (planId) => PLANS[planId] || null;

/**
 * Get all plans
 */
export const getAllPlans = () => Object.values(PLANS);

/**
 * Get plan display info for UI
 */
export const getPlanDisplayInfo = (planId) => {
  const plan = getPlan(planId);
  if (!plan) return null;

  return {
    id: plan.id,
    name: plan.displayName,
    price: plan.price,
    currency: plan.currency,
    description: plan.description,
    tagline: plan.tagline,
    popular: plan.popular,
  };
};
