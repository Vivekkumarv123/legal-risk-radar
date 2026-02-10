import { NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth.middleware';
import { CommunityComment } from '@/models/community.model';
import { db } from '@/lib/firebaseAdmin';

// DELETE - Delete comment
export async function DELETE(request, { params }) {
    try {
        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { commentId } = await params;
        const userId = authResult.user.uid;

        // Get comment to verify ownership
        const commentDoc = await db.collection('community_comments').doc(commentId).get();
        if (!commentDoc.exists) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        const comment = commentDoc.data();
        if (comment.authorId !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await CommunityComment.delete(commentId);

        return NextResponse.json({
            success: true,
            message: 'Comment deleted successfully',
        });
    } catch (error) {
        console.error('Delete comment error:', error);
        return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    }
}
