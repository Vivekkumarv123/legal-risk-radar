import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Simple in-memory cache with TTL
const searchCache = new Map();
const CACHE_TTL = 60000; // 1 minute cache

function getCacheKey(userId, searchQuery) {
  return `${userId}:${searchQuery?.toLowerCase() || 'all'}`;
}

function getFromCache(key) {
  const cached = searchCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  searchCache.delete(key);
  return null;
}

function setCache(key, data) {
  // Limit cache size to prevent memory issues
  if (searchCache.size > 1000) {
    const firstKey = searchCache.keys().next().value;
    searchCache.delete(firstKey);
  }
  searchCache.set(key, { data, timestamp: Date.now() });
}

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || cookieStore.get("refreshToken")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    const userId = decoded.id;

    // Get search query from URL params
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search');

    // Check cache first
    const cacheKey = getCacheKey(userId, searchQuery);
    const cachedResult = getFromCache(cacheKey);
    if (cachedResult) {
      return NextResponse.json({ success: true, chats: cachedResult, cached: true });
    }

    let query = db.collection("chats")
      .where("userId", "==", userId)
      .orderBy("updatedAt", "desc");

    // If search query exists, we'll filter after fetching
    // Firestore doesn't support full-text search natively
    const chatsSnapshot = await query.limit(100).get();

    let chats = chatsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "New Conversation",
        updatedAt: data.updatedAt?.toDate().toISOString(),
        createdAt: data.createdAt?.toDate().toISOString(),
        lastMessage: data.messages?.[data.messages.length - 1]?.content?.substring(0, 150) || ""
      };
    });

    // Filter by search query if provided
    if (searchQuery && searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      chats = chats.filter(chat => 
        chat.title?.toLowerCase().includes(lowerQuery) ||
        chat.lastMessage?.toLowerCase().includes(lowerQuery)
      );
    }

    // Limit results for non-search queries
    if (!searchQuery) {
      chats = chats.slice(0, 50);
    }

    // Cache the result
    setCache(cacheKey, chats);

    return NextResponse.json({ success: true, chats });
  } catch (error) {
    console.error("Fetch Chats Error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}