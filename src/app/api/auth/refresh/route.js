import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "@/utils/token.utils";

export async function POST(req) {
  try {
    // 1. Read refresh token from cookies or body
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/refreshToken=([^;]+)/);
    let refreshToken = match?.[1];

    if (!refreshToken) {
      try {
        const body = await req.json();
        refreshToken = body.refreshToken;
      } catch (e) {}
    }

    if (!refreshToken) {
      return NextResponse.json({ message: "Refresh token required" }, { status: 401 });
    }

    // 2. Verify the Refresh Token cryptographically
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      try {
        decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      } catch (e2) {
        return NextResponse.json({ message: "Invalid or expired refresh token" }, { status: 401 });
      }
    }

    if (!decoded?.id) {
      return NextResponse.json({ message: "Invalid token payload" }, { status: 403 });
    }

    const userId = decoded.id;

    // 3. Verify user exists in database
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      const snapshot = await db.collection("users").where("refreshToken", "==", refreshToken).limit(1).get();
      if (snapshot.empty) {
        return NextResponse.json({ message: "User no longer exists" }, { status: 403 });
      }
    }

    // 4. Generate New Access Token
    const newAccessToken = generateAccessToken(userId);

    return NextResponse.json({ accessToken: newAccessToken }, { status: 200 });

  } catch (err) {
    console.error("Refresh error", err);
    return NextResponse.json({ message: "Invalid or expired refresh token" }, { status: 401 });
  }
}