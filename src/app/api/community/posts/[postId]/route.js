import { NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth.middleware';
import { CommunityPost, CommunityComment } from '@/models/community.model';

// GET - Fetch single post with comments
export async function GET(request, { params }) {
    try {
        const { postId } = await params;

        const post = await CommunityPost.findById(postId);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Increment view count
        await CommunityPost.incrementViews(postId);

        // Fetch comments
        const comments = await CommunityComment.findByPostId(postId);

        return NextResponse.json({
            success: true,
            post: { ...post, views: post.views + 1 },
            comments,
        });
    } catch (error) {
        console.error('Fetch post error:', error);
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
    }
}

// PUT - Update post
export async function PUT(request, { params }) {
    try {
        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { postId } = await params;
        const userId = authResult.user.uid;
        const updates = await request.json();

        const post = await CommunityPost.findById(postId);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        if (post.authorId !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await CommunityPost.update(postId, updates);

        return NextResponse.json({
            success: true,
            message: 'Post updated successfully',
        });
    } catch (error) {
        console.error('Update post error:', error);
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
}

// DELETE - Delete post
export async function DELETE(request, { params }) {
    try {
        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { postId } = await params;
        const userId = authResult.user.uid;

        const post = await CommunityPost.findById(postId);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        if (post.authorId !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await CommunityPost.delete(postId);

        return NextResponse.json({
            success: true,
            message: 'Post deleted successfully',
        });
    } catch (error) {
        console.error('Delete post error:', error);
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }
}
