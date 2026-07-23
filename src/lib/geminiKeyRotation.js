import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Gemini API Key Rotation Manager
 * Handles multiple API keys to avoid rate limits
 */
class GeminiKeyRotation {
    constructor() {
        this.keys = this.loadKeys();
        this.currentIndex = 0;
        this.keyUsage = new Map(); // Track usage per key
        this.keyErrors = new Map(); // Track errors per key
        this.maxRetries = this.keys.length; // Try all keys before failing
    }

    /**
     * Load all available Gemini API keys from environment
     */
    loadKeys() {
        const keys = [];
        
        // Load numbered keys (GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.)
        for (let i = 1; i <= 10; i++) {
            const key = process.env[`GEMINI_API_KEY_${i}`];
            if (key && key.trim()) {
                keys.push({
                    key: key.trim(),
                    name: `GEMINI_API_KEY_${i}`,
                    index: i
                });
            }
        }

        // Fallback to single key if no numbered keys found
        if (keys.length === 0 && process.env.GEMINI_API_KEY) {
            keys.push({
                key: process.env.GEMINI_API_KEY.trim(),
                name: 'GEMINI_API_KEY',
                index: 0
            });
        }

        if (keys.length === 0) {
            throw new Error('No Gemini API keys found in environment variables');
        }

        console.log(`✅ Loaded ${keys.length} Gemini API key(s)`);
        return keys;
    }

    /**
     * Get current API key
     */
    getCurrentKey() {
        return this.keys[this.currentIndex];
    }

    /**
     * Rotate to next key
     */
    rotateKey() {
        this.currentIndex = (this.currentIndex + 1) % this.keys.length;
        const newKey = this.getCurrentKey();
        console.log(`🔄 Rotated to ${newKey.name}`);
        return newKey;
    }

    /**
     * Get GoogleGenerativeAI instance with current key
     */
    getGenAI() {
        const currentKey = this.getCurrentKey();
        return new GoogleGenerativeAI(currentKey.key);
    }

    /**
     * Track successful usage
     */
    trackSuccess(keyName) {
        const count = this.keyUsage.get(keyName) || 0;
        this.keyUsage.set(keyName, count + 1);
    }

    /**
     * Track error
     */
    trackError(keyName, error) {
        const errors = this.keyErrors.get(keyName) || [];
        errors.push({
            timestamp: new Date(),
            error: error.message
        });
        this.keyErrors.set(keyName, errors);
    }

    /**
     * Get usage statistics
     */
    getStats() {
        return {
            totalKeys: this.keys.length,
            currentKey: this.getCurrentKey().name,
            usage: Object.fromEntries(this.keyUsage),
            errors: Object.fromEntries(
                Array.from(this.keyErrors.entries()).map(([key, errors]) => [
                    key,
                    errors.length
                ])
            )
        };
    }

    /**
     * Execute with automatic key rotation on rate limit
     */
    async executeWithRotation(operation, maxRetries = null) {
        const retries = maxRetries || this.maxRetries;
        let lastError = null;

        for (let attempt = 0; attempt < retries; attempt++) {
            const currentKey = this.getCurrentKey();
            
            try {
                console.log(`🔑 Using ${currentKey.name} (attempt ${attempt + 1}/${retries})`);
                
                const result = await operation(this.getGenAI());
                
                // Track success
                this.trackSuccess(currentKey.name);
                
                return result;
            } catch (error) {
                lastError = error;
                
                // Track error
                this.trackError(currentKey.name, error);
                
                console.error(`❌ Error with ${currentKey.name}:`, error.message);

                // Check if it's a rate limit error
                const isRateLimit = 
                    error.message?.includes('429') ||
                    error.message?.includes('quota') ||
                    error.message?.includes('rate limit') ||
                    error.status === 429;

                if (isRateLimit && attempt < retries - 1) {
                    console.log(`⚠️  Rate limit hit on ${currentKey.name}, rotating to next key...`);
                    this.rotateKey();
                    
                    // Small delay before retry
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                }

                // If not rate limit or last attempt, throw error
                if (attempt === retries - 1) {
                    throw new Error(
                        `All ${retries} API keys exhausted. Last error: ${error.message}`
                    );
                }
            }
        }

        throw lastError;
    }

    /**
     * Reset rotation to first key
     */
    reset() {
        this.currentIndex = 0;
        console.log('🔄 Reset to first key');
    }
}

// Singleton instance
let geminiRotation = null;

/**
 * Get or create Gemini rotation instance
 */
export function getGeminiRotation() {
    if (!geminiRotation) {
        geminiRotation = new GeminiKeyRotation();
    }
    return geminiRotation;
}

/**
 * Execute Gemini operation with automatic key rotation
 */
export async function executeWithKeyRotation(operation) {
    const rotation = getGeminiRotation();
    return rotation.executeWithRotation(operation);
}

/**
 * Get current Gemini instance
 */
export function getGeminiInstance() {
    const rotation = getGeminiRotation();
    return rotation.getGenAI();
}

/**
 * Get rotation statistics
 */
export function getRotationStats() {
    const rotation = getGeminiRotation();
    return rotation.getStats();
}

export default GeminiKeyRotation;
