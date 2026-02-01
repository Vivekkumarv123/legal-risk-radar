import { NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth.middleware';

export async function GET(request) {
    try {
        const authResult = await verifyToken(request);
        
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            message: 'Authentication working',
            user: authResult.user
        });

    } catch (error) {
        console.error('Test auth error:', error);
        return NextResponse.json({ error: 'Test failed' }, { status: 500 });
    }
}