import { NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth.middleware';
import { CommunityPost, UserReputation } from '@/models/community.model';

// GET - Fetch all posts with filters
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const type = searchParams.get('type');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');

        let posts;

        if (search) {
            posts = await CommunityPost.search(search);
        } else {
            const filters = { category, type, limit };
            posts = await CommunityPost.findAll(filters);
        }

        return NextResponse.json({
            success: true,
            posts,
            count: posts.length,
        });
    } catch (error) {
        console.error('Fetch posts error:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

// POST - Create new post
export async function POST(request) {
    try {
        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = authResult.user.uid;
        const userEmail = authResult.user.email;
        const data = await request.json();

        const post = await CommunityPost.create(userId, {
            ...data,
            authorEmail: userEmail,
        });

        // Update user reputation and post count
        await UserReputation.updateReputation(userId, 5); // 5 points for creating a post
        await UserReputation.incrementPostCount(userId);

        return NextResponse.json({
            success: true,
            post,
        });
    } catch (error) {
        console.error('Create post error:', error);
        return NextResponse.json({ 
            error: 'Failed to create post',
            details: error.message 
        }, { status: 500 });
    }
}
