import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { sendEmail } from "@/utils/email.utils";
import {
  getAccountDeletedEmailHtml,
  getAccountDeletedEmailText
} from "@/utils/email-templates";

export async function DELETE() {
  try {
    // 1. Verify User via Cookie
    const cookieStore = await cookies();
    const token =
      cookieStore.get("token")?.value ||
      cookieStore.get("refreshToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    const userId = decoded.id;

    if (!userId) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 403 });
    }

    // ==========================================================
    // STEP 1.5: FETCH USER DATA BEFORE DELETION (IMPORTANT)
    // ==========================================================
    const userSnap = await db.collection("users").doc(userId).get();
    const userData = userSnap.exists ? userSnap.data() : null;

    const userEmail = userData?.email;
    const userName = userData?.name;

    // ==========================================================
    // HELPER: Recursive Delete for Subcollections
    // ==========================================================
    async function deleteCollection(collectionRef, batchSize) {
      const query = collectionRef.orderBy("__name__").limit(batchSize);

      const snapshot = await query.get();
      if (snapshot.empty) return;

      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();

      await deleteCollection(collectionRef, batchSize);
    }

    // ==========================================================
    // STEP 2: DELETE CHATS & MESSAGES
    // ==========================================================
    const chatsSnapshot = await db
      .collection("chats")
      .where("userId", "==", userId)
      .get();

    await Promise.all(
      chatsSnapshot.docs.map(async doc => {
        await deleteCollection(doc.ref.collection("messages"), 400);
        await doc.ref.delete();
      })
    );

    // ==========================================================
    // STEP 3: DELETE USER & USAGE DATA
    // ==========================================================
    const batch = db.batch();

    batch.delete(db.collection("usage_limits").doc(`user_${userId}`));
    batch.delete(db.collection("users").doc(userId));

    await batch.commit();

    // ==========================================================
    // STEP 4: CLEAR COOKIES
    // ==========================================================
    cookieStore.delete("token");
    cookieStore.delete("refreshToken");

    // ==========================================================
    // STEP 5: SEND CONFIRMATION EMAIL
    // ==========================================================
    if (userEmail) {
      await sendEmail({
        to: userEmail,
        subject: "Your Legal Advisor Account Has Been Deleted",
        html: getAccountDeletedEmailHtml(userName, userEmail),
        text: getAccountDeletedEmailText(userName, userEmail),
      }).catch(err =>
        console.error("Account deletion email error:", err)
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });

  } catch (error) {
    console.error("Delete Account Error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
