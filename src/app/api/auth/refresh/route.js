import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin"; // Ensure this points to your firebaseAdmin setup
import jwt from "jsonwebtoken";
import { generateAccessToken } from "@/utils/token.utils";

export async function POST(req) {
  try {
    // 1. Read refresh token from cookies
    // (Using Next.js 'cookies' helper is cleaner, but manual regex works too)
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/refreshToken=([^;]+)/);
    const refreshToken = match?.[1];

    if (!refreshToken) {
      return NextResponse.json({ message: "Refresh token required" }, { status: 401 });
    }

    // 2. FIRESTORE QUERY (Replaces User.findOne)
    // We query the 'users' collection where the field 'refreshToken' matches
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("refreshToken", "==", refreshToken).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({ message: "Invalid refresh token" }, { status: 403 });
    }

    // Get the user document (snapshot.docs[0])
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id; // Use Document ID as the User ID

    // 3. Verify the Refresh Token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Ensure the token belongs to the user we found
    if (!decoded?.id || decoded.id !== userId) {
        return NextResponse.json({ message: "Invalid token payload" }, { status: 403 });
    }

    // 4. Generate New Access Token
    const newAccessToken = generateAccessToken(userId);

    return NextResponse.json({ accessToken: newAccessToken }, { status: 200 });

  } catch (err) {
    console.error("Refresh error", err);
    return NextResponse.json({ message: "Invalid or expired refresh token" }, { status: 401 });
  }
}