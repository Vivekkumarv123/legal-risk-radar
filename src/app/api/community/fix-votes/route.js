import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// GET - Fix vote counts by recalculating from votes collection
export async function GET(request) {
    try {
        // Get all posts
        const postsSnapshot = await db.collection('community_posts').get();
        const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Get all comments
        const commentsSnapshot = await db.collection('community_comments').get();
        const comments = commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Get all votes
        const votesSnapshot = await db.collection('community_votes').get();
        const votes = votesSnapshot.docs.map(doc => doc.data());

        let fixed = 0;

        // Fix post vote counts
        for (const post of posts) {
            const postVotes = votes.filter(v => v.postId === post.id && !v.commentId);
            const upvotes = postVotes.filter(v => v.type === 'upvote').length;
            const downvotes = postVotes.filter(v => v.type === 'downvote').length;

            if (post.upvotes !== upvotes || post.downvotes !== downvotes) {
                await db.collection('community_posts').doc(post.id).update({
                    upvotes,
                    downvotes,
                });
                fixed++;
            }
        }

        // Fix comment vote counts
        for (const comment of comments) {
            const commentVotes = votes.filter(v => v.commentId === comment.id && !v.postId);
            const upvotes = commentVotes.filter(v => v.type === 'upvote').length;
            const downvotes = commentVotes.filter(v => v.type === 'downvote').length;

            if (comment.upvotes !== upvotes || comment.downvotes !== downvotes) {
                await db.collection('community_comments').doc(comment.id).update({
                    upvotes,
                    downvotes,
                });
                fixed++;
            }
        }

        // Remove duplicate votes (keep only the latest vote per user per post/comment)
        const userVoteMap = new Map();
        const duplicates = [];

        for (const doc of votesSnapshot.docs) {
            const vote = doc.data();
            const key = `${vote.userId}_${vote.postId || ''}_${vote.commentId || ''}`;
            
            if (userVoteMap.has(key)) {
                // Duplicate found - mark older one for deletion
                const existing = userVoteMap.get(key);
                const existingDate = existing.data.createdAt?.toDate?.() || new Date(0);
                const currentDate = vote.createdAt?.toDate?.() || new Date(0);
                
                if (currentDate > existingDate) {
                    // Current is newer, delete existing
                    duplicates.push(existing.id);
                    userVoteMap.set(key, { id: doc.id, data: vote });
                } else {
                    // Existing is newer, delete current
                    duplicates.push(doc.id);
                }
            } else {
                userVoteMap.set(key, { id: doc.id, data: vote });
            }
        }

        // Delete duplicates
        for (const voteId of duplicates) {
            await db.collection('community_votes').doc(voteId).delete();
        }

        return NextResponse.json({
            success: true,
            message: `Fixed ${fixed} vote counts and removed ${duplicates.length} duplicate votes`,
            stats: {
                totalPosts: posts.length,
                totalComments: comments.length,
                totalVotes: votes.length,
                duplicatesRemoved: duplicates.length,
                countsFixed: fixed,
            }
        });
    } catch (error) {
        console.error('Fix votes error:', error);
        return NextResponse.json({ 
            error: 'Failed to fix votes',
            details: error.message 
        }, { status: 500 });
    }
}
