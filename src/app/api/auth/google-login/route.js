import { NextResponse } from "next/server";
import { authController } from "@/controllers/auth.controller.js";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const body = await req.json();

    // 1. Delegate logic to the Controller
    // The controller handles:
    // - Verifying the Google Token
    // - Checking if the user exists in Firestore
    // - Creating the user if they don't exist
    // - Updating the Refresh Token using User.update() (FIXES YOUR ERROR)
    const result = await authController.googleLogin(body);

    // 2. Set the Cookie using Next.js headers
    const cookieStore = cookies();
    cookieStore.set("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    // 3. Return Success
    return NextResponse.json(
      { 
        message: result.message, 
        accessToken: result.accessToken 
      }, 
      { status: 200 }
    );

  } catch (err) {
    console.error('Google login error', err);
    
    return NextResponse.json(
      { message: err.message || "Google authentication failed" }, 
      { status: 401 }
    );
  }
}