/**
 * Fast Pre-Classifier Engine (< 1ms Execution Time)
 * Analyzes script regex, lexicon density, explicit directives, and legal terminology.
 */

const DEVANAGARI_REGEX = /[\u0900-\u097F]/;
const BENGALI_REGEX = /[\u0980-\u09FF]/;
const GUJARATI_REGEX = /[\u0A80-\u0AFF]/;
const TAMIL_REGEX = /[\u0B80-\u0BFF]/;
const TELUGU_REGEX = /[\u0C00-\u0C7F]/;

const HINDI_KEYWORDS = new Set([
  'bhai', 'kya', 'hai', 'batao', 'kaise', 'karu', 'mera', 'apna', 'chahiye', 'ek',
  'samajh', 'na', 'kar', 'suno', 'bolo', 'kaun', 'kyun', 'kaha', 'kaisa', 'matlab',
  'samjhao', 'dikkat', 'madad', 'zaroorat'
]);

const MARATHI_KEYWORDS = new Set([
  'kasa', 'aahe', 'mhaajha', 'bhau', 'saanga', 'paahije', 'kai', 'nako', 'mula',
  'kiti', 'konta', 'khup', 'mhit'
]);

const EXPLICIT_OVERRIDE_RULES = [
  { pattern: /(?:aaj\s+se\s+)?(?:pure\s+|shuddh\s+)?hindi(?:\s+me)?(?:\s+hi)?(?:\s+baat\s+karna|\s+batao|\s+samjha|\s+samjhao)?/i, lang: 'hindi', defaultScript: 'devanagari' },
  { pattern: /(?:speak|talk|explain)\s+in\s+hindi/i, lang: 'hindi', defaultScript: 'devanagari' },
  { pattern: /(?:aaj\s+se\s+)?english\s+me(?:\s+hi)?(?:\s+baat\s+karna|\s+batao|\s+explain)?/i, lang: 'english', defaultScript: 'latin' },
  { pattern: /(?:speak|talk|explain)\s+in\s+english/i, lang: 'english', defaultScript: 'latin' },
  { pattern: /(?:speak|talk|explain)\s+in\s+hinglish/i, lang: 'hinglish', defaultScript: 'latin' },
  { pattern: /(?:marathi\s+mhadhe|in\s+marathi|marathi\s+me)/i, lang: 'marathi', defaultScript: 'devanagari' },
];

const LEGAL_ADVOCATE_TERMS = [
  'section 73', 'indian contract act', 'precedents', 'stipulation', 'prima facie',
  'jurisdiction', 'sub-clause', 'tortious', 'adjudication', 'statutory'
];

const LEGAL_BUSINESS_TERMS = [
  'indemnity', 'limitation of liability', 'force majeure', 'termination', 'breach',
  'arbitration', 'severability', 'confidentiality', 'warranty', 'covenant'
];

export class FastPreClassifier {
  /**
   * Fast classification executed in < 1ms
   * @param {string} input 
   * @returns {Object} PreClassifierResult
   */
  static analyze(input) {
    if (!input || typeof input !== 'string') {
      return {
        detectedLanguage: 'english',
        script: 'latin',
        detectedToneKeywords: [],
        inferredExpertise: 'layman',
        isExplicitOverride: false,
      };
    }

    const lower = input.toLowerCase().trim();

    // 1. Check Explicit Language Override Directives
    for (const rule of EXPLICIT_OVERRIDE_RULES) {
      if (rule.pattern.test(lower)) {
        const isNativeScript = DEVANAGARI_REGEX.test(input);
        return {
          detectedLanguage: rule.lang,
          script: rule.defaultScript || (isNativeScript ? 'devanagari' : 'latin'),
          detectedToneKeywords: [],
          isExplicitOverride: true,
          overrideLanguage: rule.lang,
        };
      }
    }

    // 2. Script Detection
    let script = 'latin';
    let scriptDetectedLang = null;

    if (DEVANAGARI_REGEX.test(input)) {
      script = 'devanagari';
    } else if (BENGALI_REGEX.test(input)) {
      script = 'native';
      scriptDetectedLang = 'bengali';
    } else if (GUJARATI_REGEX.test(input)) {
      script = 'native';
      scriptDetectedLang = 'gujarati';
    } else if (TAMIL_REGEX.test(input)) {
      script = 'native';
      scriptDetectedLang = 'tamil';
    } else if (TELUGU_REGEX.test(input)) {
      script = 'native';
      scriptDetectedLang = 'telugu';
    }

    // 3. Lexicon Density Analysis
    const words = lower.split(/\s+/);
    let hindiHits = 0;
    let marathiHits = 0;
    const detectedToneKeywords = [];

    for (const w of words) {
      const cleanWord = w.replace(/[^a-z]/g, '');
      if (!cleanWord) continue;

      if (HINDI_KEYWORDS.has(cleanWord)) hindiHits++;
      if (MARATHI_KEYWORDS.has(cleanWord)) marathiHits++;

      if (['bhai', 'bro', 'yaar', 'boss', 'sir'].includes(cleanWord)) {
        detectedToneKeywords.push(cleanWord);
      }
    }

    // Determine Inferred Language
    let detectedLanguage = 'english';
    if (scriptDetectedLang) {
      detectedLanguage = scriptDetectedLang;
    } else if (script === 'devanagari') {
      detectedLanguage = marathiHits > hindiHits ? 'marathi' : 'hindi';
    } else if (hindiHits > 0) {
      detectedLanguage = 'hinglish';
    } else if (marathiHits > 0) {
      detectedLanguage = 'marathi';
    }

    // 4. Inferred Legal Expertise Level
    let inferredExpertise = undefined;
    const textLower = lower;

    if (LEGAL_ADVOCATE_TERMS.some(term => textLower.includes(term))) {
      inferredExpertise = 'advocate';
    } else if (LEGAL_BUSINESS_TERMS.some(term => textLower.includes(term))) {
      inferredExpertise = 'business';
    } else if (textLower.includes('kya hota hai') || textLower.includes('what is') || textLower.includes('help me understand')) {
      inferredExpertise = 'layman';
    }

    return {
      detectedLanguage,
      script,
      detectedToneKeywords,
      inferredExpertise,
      isExplicitOverride: false,
    };
  }
}
