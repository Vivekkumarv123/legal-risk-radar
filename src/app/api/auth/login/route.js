import { NextResponse } from "next/server";
import { authController } from "@/controllers/auth.controller.js";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    // 1. Parse Request
    const body = await req.json();

    // 2. Call Controller (Handles validation, DB lookup, hashing, token generation)
    const result = await authController.login(body);

    // 3. Set Refresh Token Cookie
    // Next.js App Router handles the headers automatically with this API
    const cookieStore = cookies();
    cookieStore.set("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none", // Matches your original code (requires Secure: true in Prod)
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    // 4. Return Access Token & Success Message
    return NextResponse.json(
      { 
        message: result.message, 
        accessToken: result.accessToken 
      }, 
      { status: 200 }
    );

  } catch (err) {
    console.error('Login error', err);

    const status = err.message === 'Invalid credentials' ? 400 : 500;
    const message = err.message || 'Login failed';

    return NextResponse.json({ message }, { status });
  }
}