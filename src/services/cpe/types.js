/**
 * Native Multilingual Conversation Engine - Type Definitions & Constants
 */

/**
 * @typedef {'english' | 'hindi' | 'hinglish' | 'marathi' | 'gujarati' | 'tamil' | 'telugu' | 'bengali'} SupportedLanguage
 * @typedef {'latin' | 'devanagari' | 'native'} ScriptPreference
 * @typedef {'formal' | 'professional' | 'friendly' | 'casual'} ConversationTone
 * @typedef {'layman' | 'business' | 'advocate'} LegalExpertiseLevel
 */

/**
 * @typedef {Object} ExplicitUserPreferences
 * @property {SupportedLanguage} [lockedLanguage]
 * @property {ScriptPreference} [lockedScript]
 * @property {ConversationTone} [lockedTone]
 */

/**
 * @typedef {Object} ConversationProfile
 * @property {string} sessionId
 * @property {string} userId
 * @property {SupportedLanguage} primaryLanguage
 * @property {ScriptPreference} scriptPreference
 * @property {ConversationTone} conversationTone
 * @property {number} personaIntensity - 0.0 (subtle) to 1.0 (pronounced)
 * @property {LegalExpertiseLevel} legalExpertise
 * @property {'concise' | 'balanced' | 'detailed'} responseLength
 * @property {number} codeSwitchIndex
 * @property {Record<SupportedLanguage, number>} ewmaLanguageVector
 * @property {number} profileConfidence - 0.0 (new) to 1.0 (mature)
 * @property {number} turnCount
 * @property {ExplicitUserPreferences} explicitLocks
 * @property {number} lastUpdated
 */

export const DEFAULT_LANGUAGE_VECTOR = {
  english: 0.20,
  hindi: 0.10,
  hinglish: 0.70,
  marathi: 0.0,
  gujarati: 0.0,
  tamil: 0.0,
  telugu: 0.0,
  bengali: 0.0,
};

export const DEFAULT_PROFILE = {
  primaryLanguage: 'hinglish',
  scriptPreference: 'latin',
  conversationTone: 'friendly',
  personaIntensity: 0.6,
  legalExpertise: 'layman',
  responseLength: 'balanced',
  codeSwitchIndex: 0.5,
  ewmaLanguageVector: { ...DEFAULT_LANGUAGE_VECTOR },
  profileConfidence: 0.2,
  turnCount: 0,
  explicitLocks: {},
};
