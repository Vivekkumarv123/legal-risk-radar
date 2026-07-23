import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { feedbackController } from "@/controllers/feedback.controller";

// ==========================================
// POST → Create Feedback (Public / Optional Auth)
// ==========================================
export async function POST(req) {
    try {
        const body = await req.json();

        // Optional user detection (no login required)
        let userId = null;
        try {
            const cookieStore = await cookies();
            const token =
                cookieStore.get("token")?.value ||
                cookieStore.get("refreshToken")?.value;

            if (token) {
                const secret =
                    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
                const decoded = jwt.verify(token, secret);
                userId = decoded?.id || null;
            }
        } catch {
            // Ignore auth errors → feedback is still allowed
        }

        const result = await feedbackController.createFeedback({
            ...body,
            userId, // stored only if present (optional future use)
        });

        return NextResponse.json(result, { status: 201 });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}

// ==========================================
// GET → Get All Feedback (Admin / Internal)
// ==========================================
export async function GET() {
    try {
        const result = await feedbackController.getAllFeedback();
        return NextResponse.json(result, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
