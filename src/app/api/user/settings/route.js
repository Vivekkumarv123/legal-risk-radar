import { NextResponse } from "next/server";
import { User } from "@/models/user.model";
import { verifyToken } from "@/middleware/auth.middleware";

export async function GET(req) {
    try {
        const authResult = await verifyToken(req);
        if (!authResult.success) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findById(authResult.user.id);
        
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                plan: user.plan || 'free'
            },
            settings: user.settings || {
                notifications: {
                    email: true,
                    push: false,
                    updates: true
                },
                privacy: {
                    shareAnalytics: false,
                    publicProfile: false
                },
                preferences: {
                    theme: "light",
                    language: "en"
                }
            }
        });
    } catch (error) {
        console.error('Settings fetch error:', error);
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const authResult = await verifyToken(req);
        if (!authResult.success) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, notifications, privacy, preferences } = body;

        const user = await User.findById(authResult.user.id);
        
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Update user fields
        const updateData = {};
        if (name) updateData.name = name;
        
        // Update settings
        updateData.settings = {
            notifications: notifications || user.settings?.notifications || {},
            privacy: privacy || user.settings?.privacy || {},
            preferences: preferences || user.settings?.preferences || {}
        };

        await User.update(user.id, updateData);

        return NextResponse.json({
            success: true,
            message: "Settings updated successfully"
        });
    } catch (error) {
        console.error('Settings update error:', error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
