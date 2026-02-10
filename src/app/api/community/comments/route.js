import { NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth.middleware';
import { CommunityComment, UserReputation } from '@/models/community.model';
import { User } from '@/models/user.model';

// POST - Create new comment
export async function POST(request) {
    try {
        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = authResult.user.uid;
        const userEmail = authResult.user.email;
        const data = await request.json();

        // Get user name
        const user = await User.findById(userId);
        const authorName = user?.name || userEmail?.split('@')[0] || 'Anonymous';

        const comment = await CommunityComment.create(userId, {
            ...data,
            authorEmail: userEmail,
            authorName: authorName,
        });

        // Update user reputation and comment count
        await UserReputation.updateReputation(userId, 2); // 2 points for commenting
        await UserReputation.incrementCommentCount(userId);

        return NextResponse.json({
            success: true,
            comment,
        });
    } catch (error) {
        console.error('Create comment error:', error);
        return NextResponse.json({ 
            error: 'Failed to create comment',
            details: error.message 
        }, { status: 500 });
    }
}

