import { NextResponse } from "next/server";
import { verifyToken } from "@/middleware/auth.middleware";
import mongoose from "mongoose";

// Bug Report Schema
const bugReportSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    category: { type: String, required: true },
    steps: String,
    expected: String,
    actual: String,
    screenshots: [String],
    status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const BugReport = mongoose.models.BugReport || mongoose.model('BugReport', bugReportSchema);

export async function POST(req) {
    try {
        const authResult = await verifyToken(req);
        if (!authResult.success) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        
        const bugData = {
            userId: authResult.user.id,
            title: formData.get('title'),
            description: formData.get('description'),
            severity: formData.get('severity') || 'medium',
            category: formData.get('category'),
            steps: formData.get('steps') || '',
            expected: formData.get('expected') || '',
            actual: formData.get('actual') || '',
            screenshots: []
        };

        const bugReport = await BugReport.create(bugData);

        console.log('New bug report:', bugReport._id);

        return NextResponse.json({
            success: true,
            message: "Bug report submitted successfully",
            reportId: bugReport._id
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

        const reports = await BugReport.find({ userId: authResult.user.id })
            .sort({ createdAt: -1 })
            .limit(20);

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
