import { NextResponse } from "next/server";
import { verifyToken } from "@/middleware/auth.middleware";
import { db } from "@/lib/firebaseAdmin";

export async function POST(req) {
    try {
        const authResult = await verifyToken(req);
        if (!authResult.success) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        
        const bugData = {
            userId: authResult.user.id,
            title: formData.get('title') || '',
            description: formData.get('description') || '',
            severity: formData.get('severity') || 'medium',
            category: formData.get('category') || '',
            steps: formData.get('steps') || '',
            expected: formData.get('expected') || '',
            actual: formData.get('actual') || '',
            screenshots: [],
            status: 'open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const docRef = await db.collection('bugReports').add(bugData);

        console.log('New bug report:', docRef.id);

        return NextResponse.json({
            success: true,
            message: "Bug report submitted successfully",
            reportId: docRef.id
        });
    } catch (error) {
        console.error('Bug report error:', error);
        return NextResponse.json(
            { error: "Failed to submit bug report" },
            { status: 500 }
        );
    }
}

export async function GET(req) {
    try {
        const authResult = await verifyToken(req);
        if (!authResult.success) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const snapshot = await db.collection('bugReports')
            .where('userId', '==', authResult.user.id)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        const reports = [];
        snapshot.forEach(doc => {
            reports.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return NextResponse.json({
            success: true,
            reports
        });
    } catch (error) {
        console.error('Fetch bug reports error:', error);
        return NextResponse.json(
            { error: "Failed to fetch bug reports" },
            { status: 500 }
        );
    }
}
