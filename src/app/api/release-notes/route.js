import { NextResponse } from "next/server";

export async function GET() {
    try {
        // In production, fetch from database
        const releases = [
            {
                version: "2.1.0",
                date: "2026-02-08",
                isLatest: true,
                changes: [
                    {
                        type: "feature",
                        title: "Multiple File Upload",
                        description: "Upload up to 3 files at once with drag & drop and Ctrl+V paste support"
                    },
                    {
                        type: "feature",
                        title: "Enhanced Search",
                        description: "Search through your chat history with debounced real-time results"
                    },
                    {
                        type: "improvement",
                        title: "Improved UI/UX",
                        description: "Redesigned file preview with horizontal thumbnail layout"
                    },
                    {
                        type: "bugfix",
                        title: "Fixed Logout Issue",
                        description: "Resolved authentication token clearing on logout"
                    }
                ]
            },
            {
                version: "2.0.0",
                date: "2026-01-15",
                isLatest: false,
                changes: [
                    {
                        type: "feature",
                        title: "Voice Interface",
                        description: "Interact with Legal Advisor using voice commands in multiple languages"
                    },
                    {
                        type: "feature",
                        title: "Chat Sharing",
                        description: "Share your legal analysis with others via secure links"
                    },
                    {
                        type: "security",
                        title: "Enhanced Security",
                        description: "Implemented JWT refresh tokens and improved authentication"
                    }
                ]
            },
            {
                version: "1.5.0",
                date: "2025-12-20",
                isLatest: false,
                changes: [
                    {
                        type: "feature",
                        title: "Clause Comparison",
                        description: "Compare clauses across multiple legal documents"
                    },
                    {
                        type: "feature",
                        title: "Legal Glossary",
                        description: "Interactive legal terminology dictionary with search"
                    },
                    {
                        type: "improvement",
                        title: "Performance Optimization",
                        description: "Reduced API response times by 40%"
                    }
                ]
            }
        ];

        return NextResponse.json({
            success: true,
            releases
        });
    } catch (error) {
        console.error('Release notes error:', error);
        return NextResponse.json(
            { error: "Failed to fetch release notes" },
            { status: 500 }
        );
    }
}
