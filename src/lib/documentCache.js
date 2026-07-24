import crypto from "crypto";

// Bounds the cache capacity to prevent memory footprint issues
const MAX_CACHE_SIZE = 500;

// Use global binding so the cache persists across Next.js dev server hot-reloads
const globalOcrCache = global.ocrCache || new Map();
global.ocrCache = globalOcrCache;

/**
 * Computes the SHA-256 hash of a file buffer
 */
export function getBufferHash(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    buffer = Buffer.from(buffer);
  }
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Retrieves cached text of a document buffer if available
 */
export function getCachedDocumentText(buffer) {
  if (!buffer) return null;
  const hash = getBufferHash(buffer);
  const text = globalOcrCache.get(hash);
  if (text) {
    console.log(`[Cache Hit] SHA-256 hash: ${hash.substring(0, 10)}... Loaded from cache.`);
    return text;
  }
  return null;
}

/**
 * Stores document text in the cache, evicting the oldest entries if capacity is reached
 */
export function setCachedDocumentText(buffer, text) {
  if (!buffer || typeof text !== "string") return;
  const hash = getBufferHash(buffer);

  // LRU eviction
  if (globalOcrCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = globalOcrCache.keys().next().value;
    if (oldestKey) {
      globalOcrCache.delete(oldestKey);
      console.log(`[Cache Eviction] Capacity reached. Evicted oldest key: ${oldestKey.substring(0, 10)}...`);
    }
  }

  globalOcrCache.set(hash, text);
  console.log(`[Cache Store] SHA-256 hash: ${hash.substring(0, 10)}... Saved to cache.`);
}
