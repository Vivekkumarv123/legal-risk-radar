import { NextResponse } from "next/server";
import { authController } from "@/controllers/auth.controller.js"; // Check path
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    // 1. Get Cookies (Await is required in Next.js 15/newest)
    const cookieStore = await cookies();
    
    // 2. Retrieve the token from the cookie (Preferred over header for logout)
    const refreshToken = cookieStore.get("refreshToken")?.value;

    // 3. ALWAYS Delete the cookie immediately
    // Even if the token is invalid or expired, we want the browser to forget it.
    cookieStore.delete("refreshToken");

    // 4. (Optional) Invalidate in Database
    // We try to decode the token to find the user and clear their DB record.
    if (refreshToken) {
      try {
        // Try verifying with Refresh Secret
        const decoded = jwt.verify(
            refreshToken, 
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        );
        
        if (decoded?.id) {
          await authController.logout(decoded.id);
        }
      } catch (err) {
        // If token is expired/invalid, we don't care, the cookie is already deleted.
      }
    }

    return NextResponse.json(
      { message: 'Logout successful' }, 
      { status: 200 }
    );

  } catch (err) {
    console.error('Logout error', err);
    // Even if error, return 200 so frontend redirects
    return NextResponse.json(
      { message: 'Logout processed' }, 
      { status: 200 }
    );
  }
}