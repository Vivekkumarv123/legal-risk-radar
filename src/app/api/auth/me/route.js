import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
// ⚠️ Ensure this path is correct. If you named the file User.js, import from "@/models/User"
import { User } from "@/models/user.model.js"; 

export async function GET(req) {
  try {
    let userId = null;

    // 1. Check Header
    const authHeader = req.headers.get("authorization");
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // Header token invalid
      }
    }

    // 2. Check Cookie (Fallback)
    if (!userId) {
      const cookieStore = await cookies();
      const refreshToken = cookieStore.get("refreshToken")?.value;

      if (refreshToken) {
        try {
          const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
          userId = decoded.id;
        } catch (err) {
           // Try main secret fallback
           try {
             const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
             userId = decoded.id;
           } catch (e) { /* invalid */ }
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 3. Fetch User (Corrected Logic)
    // We await the result. It returns the raw data object or null.
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 4. Manually Select Fields (Instead of .select())
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      provider: user.provider
    };

    return NextResponse.json({ success: true, user: safeUser }, { status: 200 });

  } catch (err) {
    console.error("Me API Error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}