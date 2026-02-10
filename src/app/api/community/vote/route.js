import { NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth.middleware';
import { CommunityVote, UserReputation } from '@/models/community.model';

// POST - Vote on post or comment
export async function POST(request) {
    try {
        const authResult = await verifyToken(request);
        if (!authResult.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = authResult.user.uid;
        const data = await request.json();

        const result = await CommunityVote.vote(userId, data);

        // Update reputation based on vote action
        if (result.action === 'added' && result.type === 'upvote') {
            await UserReputation.updateReputation(userId, 1);
        }

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error('Vote error:', error);
        return NextResponse.json({ 
            error: 'Failed to process vote',
            details: error.message 
        }, { status: 500 });
    }
}
