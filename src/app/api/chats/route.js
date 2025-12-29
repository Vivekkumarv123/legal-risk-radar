import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || cookieStore.get("refreshToken")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    const userId = decoded.id;

    // Fetch chat summaries for this user
    const chatsSnapshot = await db.collection("chats")
      .where("userId", "==", userId)
      .orderBy("updatedAt", "desc")
      .limit(20)
      .get();

    const chats = chatsSnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title || "Untitled Analysis",
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }));

    return NextResponse.json({ success: true, chats });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}