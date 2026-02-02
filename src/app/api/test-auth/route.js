import { NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth.middleware';

export async function GET(request) {
    try {
        console.log('Test auth API - GET request received');
        
        // Log all headers
        const headers = Object.fromEntries(request.headers.entries());
        console.log('Test auth API - All headers:', headers);
        
        // Check for authorization header specifically
        const authHeader = request.headers.get('authorization');
        console.log('Test auth API - Authorization header:', authHeader);
        
        // Check environment variables
        console.log('Test auth API - JWT_SECRET exists:', !!process.env.JWT_SECRET);
        console.log('Test auth API - JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
        
        const authResult = await verifyToken(request);
        console.log('Test auth API - Auth result:', authResult);
        
        return NextResponse.json({
            success: true,
            authResult,
            headers: {
                authorization: authHeader,
                'content-type': headers['content-type'],
                'user-agent': headers['user-agent']?.substring(0, 100)
            },
            environment: {
                jwtSecretExists: !!process.env.JWT_SECRET,
                jwtSecretLength: process.env.JWT_SECRET?.length || 0
            }
        });
        
    } catch (error) {
        console.error('Test auth API error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        console.log('Test auth API - POST request received');
        
        const body = await request.json();
        console.log('Test auth API - Request body:', body);
        
        const authResult = await verifyToken(request);
        console.log('Test auth API - Auth result:', authResult);
        
        return NextResponse.json({
            success: true,
            authResult,
            body,
            message: 'POST test successful'
        });
        
    } catch (error) {
        console.error('Test auth API POST error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}