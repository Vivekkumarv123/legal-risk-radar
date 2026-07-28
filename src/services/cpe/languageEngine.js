import { DEFAULT_PROFILE, DEFAULT_LANGUAGE_VECTOR } from './types.js';

export class LanguageEngine {
  /**
   * Calculates the dynamic adaptive hysteresis threshold based on conversation maturity
   * @param {number} turnCount 
   * @param {number} profileConfidence 
   * @returns {number}
   */
  static getAdaptiveThreshold(turnCount, profileConfidence) {
    if (turnCount <= 2) return 0.25; // Easy initial alignment
    if (turnCount <= 8) return 0.40; // Standard inertia
    if (profileConfidence >= 0.8) return 0.60; // Mature session high resistance
    return 0.40;
  }

  /**
   * Updates conversation profile using EWMA + Composite 4-Factor Weighting Matrix
   * @param {Object} currentProfile 
   * @param {string} userInput 
   * @param {Object} preClassifierResult 
   * @param {Array<Object>} recentWindow - Last 5 messages
   * @returns {Object} Updated ConversationProfile
   */
  static updateProfile(currentProfile = DEFAULT_PROFILE, userInput, preClassifierResult, recentWindow = []) {
    const profile = { ...DEFAULT_PROFILE, ...currentProfile };
    const { detectedLanguage, script, detectedToneKeywords, inferredExpertise, isExplicitOverride, overrideLanguage } = preClassifierResult;

    // 1. Handle Explicit Language Lock / Directive
    if (isExplicitOverride && overrideLanguage) {
      profile.explicitLocks = {
        ...profile.explicitLocks,
        lockedLanguage: overrideLanguage,
        lockedScript: script,
      };
      profile.primaryLanguage = overrideLanguage;
      profile.scriptPreference = script;
      profile.profileConfidence = 1.0;
      profile.lastUpdated = Date.now();
      return profile;
    }

    // If an explicit lock exists, honor locked values
    if (profile.explicitLocks?.lockedLanguage) {
      profile.primaryLanguage = profile.explicitLocks.lockedLanguage;
      if (profile.explicitLocks.lockedScript) {
        profile.scriptPreference = profile.explicitLocks.lockedScript;
      }
      profile.lastUpdated = Date.now();
      return profile;
    }

    // 2. Dynamic Alpha Determination for EWMA
    const wordCount = userInput.trim().split(/\s+/).length;
    const isDomainQuery = wordCount <= 4 && (inferredExpertise === 'business' || inferredExpertise === 'advocate');
    const isScriptShift = script !== profile.scriptPreference && script !== 'latin';

    let alpha = 0.35; // Standard adaptation
    if (isScriptShift) alpha = 0.60;
    else if (isDomainQuery) alpha = 0.15; // Resistance to switching on short legal jargon (e.g. "indemnity clause")

    // 3. Compute EWMA Vector
    const ewmaVector = { ...DEFAULT_LANGUAGE_VECTOR, ...(profile.ewmaLanguageVector || {}) };
    const currentInputOneHot = { ...DEFAULT_LANGUAGE_VECTOR };
    if (detectedLanguage in currentInputOneHot) {
      currentInputOneHot[detectedLanguage] = 1.0;
    }

    Object.keys(ewmaVector).forEach(lang => {
      const inputVal = currentInputOneHot[lang] || 0.0;
      const prevVal = ewmaVector[lang] || 0.0;
      ewmaVector[lang] = Number((alpha * inputVal + (1 - alpha) * prevVal).toFixed(4));
    });

    // 4. Calculate Recent 5-Window Distribution
    const recentWindowVector = { ...DEFAULT_LANGUAGE_VECTOR };
    if (recentWindow.length > 0) {
      let count = 0;
      recentWindow.forEach(msg => {
        const lang = msg.metadata?.detectedLanguage || (msg.role === 'user' ? detectedLanguage : null);
        if (lang && lang in recentWindowVector) {
          recentWindowVector[lang] += 1.0;
          count++;
        }
      });
      if (count > 0) {
        Object.keys(recentWindowVector).forEach(lang => {
          recentWindowVector[lang] = Number((recentWindowVector[lang] / count).toFixed(4));
        });
      }
    }

    // 5. Compute Composite Decision Vector
    // Formula: 0.20 * Explicit + 0.40 * EWMA + 0.30 * Window + 0.10 * Current
    const compositeScores = {};
    let maxLang = profile.primaryLanguage;
    let maxScore = -1;

    Object.keys(ewmaVector).forEach(lang => {
      const ewmaScore = ewmaVector[lang] || 0;
      const windowScore = recentWindowVector[lang] || 0;
      const currentScore = currentInputOneHot[lang] || 0;
      const explicitScore = (profile.explicitLocks?.lockedLanguage === lang) ? 1.0 : 0.0;

      const finalScore = (0.20 * explicitScore) + (0.40 * ewmaScore) + (0.30 * windowScore) + (0.10 * currentScore);
      compositeScores[lang] = Number(finalScore.toFixed(4));

      if (finalScore > maxScore) {
        maxScore = finalScore;
        maxLang = lang;
      }
    });

    // 6. Apply Adaptive Hysteresis Thresholding
    const threshold = this.getAdaptiveThreshold(profile.turnCount, profile.profileConfidence);
    const currentLangScore = compositeScores[profile.primaryLanguage] || 0;

    let selectedPrimary = profile.primaryLanguage;
    if (maxLang !== profile.primaryLanguage) {
      if (maxScore - currentLangScore > threshold) {
        selectedPrimary = maxLang; // Switch authorized
      }
    }

    // 7. Tone and Expertise Adjustments
    let conversationTone = profile.conversationTone || 'friendly';
    if (detectedToneKeywords.includes('bhai') || detectedToneKeywords.includes('yaar')) {
      conversationTone = 'friendly';
    }

    let legalExpertise = profile.legalExpertise || 'layman';
    if (inferredExpertise) {
      legalExpertise = inferredExpertise;
    }

    const updatedTurnCount = (profile.turnCount || 0) + 1;
    const updatedConfidence = Math.min(1.0, (profile.profileConfidence || 0.2) + 0.05);

    return {
      ...profile,
      primaryLanguage: selectedPrimary,
      scriptPreference: script,
      conversationTone,
      legalExpertise,
      ewmaLanguageVector: ewmaVector,
      profileConfidence: updatedConfidence,
      turnCount: updatedTurnCount,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Post-response feedback loop reinforcing profile state after assistant replies
   * @param {Object} profile 
   * @param {string} assistantText 
   * @returns {Object} Profile reinforced
   */
  static processAssistantFeedback(profile, assistantText) {
    if (!assistantText) return profile;

    const devanagariMatches = assistantText.match(/[\u0900-\u097F]/g) || [];
    const totalLetterCount = assistantText.replace(/[^a-zA-Z\u0900-\u097F]/g, '').length || 1;
    const devanagariRatio = devanagariMatches.length / totalLetterCount;

    const isPrimarilyDevanagari = devanagariRatio > 0.20;

    return {
      ...profile,
      profileConfidence: Math.min(1.0, (profile.profileConfidence || 0.5) + 0.05),
      scriptPreference: isPrimarilyDevanagari ? 'devanagari' : (profile.scriptPreference === 'devanagari' && devanagariRatio < 0.05 ? 'latin' : profile.scriptPreference),
      lastUpdated: Date.now(),
    };
  }
}
