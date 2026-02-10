import { db } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

// Validation schemas
export const PostSchema = z.object({
    title: z.string().min(10).max(200),
    content: z.string().min(20),
    category: z.enum(['contract_law', 'corporate_law', 'ip_law', 'employment_law', 'tax_law', 'general']),
    tags: z.array(z.string()).max(5),
    type: z.enum(['discussion', 'help', 'resources', 'case_studies']),
});

export const CommentSchema = z.object({
    content: z.string().min(5),
    postId: z.string(),
});

export const VoteSchema = z.object({
    postId: z.string().optional().nullable(),
    commentId: z.string().optional().nullable(),
    type: z.enum(['upvote', 'downvote']),
}).refine(data => data.postId || data.commentId, {
    message: "Either postId or commentId must be provided"
});

// Community Post Model
export class CommunityPost {
    static collection = 'community_posts';

    static async create(userId, data) {
        const validated = PostSchema.parse(data);
        
        const postData = {
            ...validated,
            authorId: userId,
            authorName: data.authorName || 'Anonymous',
            authorEmail: data.authorEmail || '',
            views: 0,
            upvotes: 0,
            downvotes: 0,
            commentCount: 0,
            isResolved: false,
            isPinned: false,
            isReported: false,
            reportCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const docRef = await db.collection(this.collection).add(postData);
        return { id: docRef.id, ...postData };
    }

    static async findById(postId) {
        const doc = await db.collection(this.collection).doc(postId).get();
        if (!doc.exists) return null;
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        };
    }

    static async findAll(filters = {}) {
        let query = db.collection(this.collection);

        if (filters.category) {
            query = query.where('category', '==', filters.category);
        }

        if (filters.type) {
            query = query.where('type', '==', filters.type);
        }

        if (filters.authorId) {
            query = query.where('authorId', '==', filters.authorId);
        }

        // Sort by creation date (newest first)
        query = query.orderBy('createdAt', 'desc');

        if (filters.limit) {
            query = query.limit(filters.limit);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data,
                createdAt: data.createdAt?.toDate?.() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            };
        });
    }

    static async update(postId, updates) {
        await db.collection(this.collection).doc(postId).update({
            ...updates,
            updatedAt: new Date(),
        });
    }

    static async delete(postId) {
        await db.collection(this.collection).doc(postId).delete();
    }

    static async incrementViews(postId) {
        const postRef = db.collection(this.collection).doc(postId);
        await postRef.update({
            views: FieldValue.increment(1),
        });
    }

    static async search(searchTerm) {
        const snapshot = await db.collection(this.collection).get();
        const posts = snapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data,
                createdAt: data.createdAt?.toDate?.() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            };
        });
        
        return posts.filter(post => 
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }
}

// Community Comment Model
export class CommunityComment {
    static collection = 'community_comments';

    static async create(userId, data) {
        const validated = CommentSchema.parse(data);
        
        const commentData = {
            ...validated,
            authorId: userId,
            authorName: data.authorName || 'Anonymous',
            authorEmail: data.authorEmail || '',
            upvotes: 0,
            downvotes: 0,
            isAccepted: false,
            isReported: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const docRef = await db.collection(this.collection).add(commentData);
        
        // Increment comment count on post
        await CommunityPost.update(data.postId, {
            commentCount: FieldValue.increment(1),
        });

        return { id: docRef.id, ...commentData };
    }

    static async findByPostId(postId) {
        const snapshot = await db.collection(this.collection)
            .where('postId', '==', postId)
            .orderBy('createdAt', 'asc')
            .get();
        
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data,
                createdAt: data.createdAt?.toDate?.() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
            };
        });
    }

    static async update(commentId, updates) {
        await db.collection(this.collection).doc(commentId).update({
            ...updates,
            updatedAt: new Date(),
        });
    }

    static async delete(commentId) {
        const comment = await db.collection(this.collection).doc(commentId).get();
        if (comment.exists) {
            const postId = comment.data().postId;
            await db.collection(this.collection).doc(commentId).delete();
            
            // Decrement comment count
            await CommunityPost.update(postId, {
                commentCount: FieldValue.increment(-1),
            });
        }
    }
}

// Community Vote Model
export class CommunityVote {
    static collection = 'community_votes';

    static async vote(userId, data) {
        const validated = VoteSchema.parse(data);
        const { postId, commentId, type } = validated;

        // Build a more efficient query - only get votes for this specific post/comment
        let query = db.collection(this.collection).where('userId', '==', userId);
        
        if (postId) {
            query = query.where('postId', '==', postId);
        } else if (commentId) {
            query = query.where('commentId', '==', commentId);
        }
        
        const votesSnapshot = await query.limit(5).get(); // Limit to 5 for safety

        // Filter to find exact match (postId with no commentId, or commentId with no postId)
        let existingVoteDoc = null;
        for (const doc of votesSnapshot.docs) {
            const voteData = doc.data();
            
            if (postId) {
                // For post votes, ensure commentId is null/undefined
                if (voteData.postId === postId && (voteData.commentId === null || voteData.commentId === undefined || !voteData.commentId)) {
                    existingVoteDoc = doc;
                    break;
                }
            } else if (commentId) {
                // For comment votes, ensure postId is null/undefined
                if (voteData.commentId === commentId && (voteData.postId === null || voteData.postId === undefined || !voteData.postId)) {
                    existingVoteDoc = doc;
                    break;
                }
            }
        }

        if (existingVoteDoc) {
            const oldVote = existingVoteDoc.data();

            // If same vote, remove it (toggle off)
            if (oldVote.type === type) {
                await existingVoteDoc.ref.delete();
                await this.updateVoteCount(postId, commentId, type, -1);
                return { action: 'removed', type };
            }

            // If different vote, switch it (remove old, add new)
            await existingVoteDoc.ref.update({ type, updatedAt: new Date() });
            await this.updateVoteCount(postId, commentId, oldVote.type, -1);
            await this.updateVoteCount(postId, commentId, type, 1);
            return { action: 'changed', type, oldType: oldVote.type };
        }

        // Create new vote
        const voteData = {
            userId,
            postId: postId || null,
            commentId: commentId || null,
            type,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.collection(this.collection).add(voteData);
        await this.updateVoteCount(postId, commentId, type, 1);
        return { action: 'added', type };
    }

    static async updateVoteCount(postId, commentId, type, increment) {
        const field = type === 'upvote' ? 'upvotes' : 'downvotes';
        
        if (postId) {
            await db.collection(CommunityPost.collection).doc(postId).update({
                [field]: FieldValue.increment(increment),
            });
        } else if (commentId) {
            await db.collection(CommunityComment.collection).doc(commentId).update({
                [field]: FieldValue.increment(increment),
            });
        }
    }

    static async getUserVote(userId, postId, commentId) {
        let query = db.collection(this.collection).where('userId', '==', userId);
        
        if (postId) {
            query = query.where('postId', '==', postId);
        } else if (commentId) {
            query = query.where('commentId', '==', commentId);
        }

        const snapshot = await query.get();
        if (snapshot.empty) return null;
        
        return snapshot.docs[0].data();
    }
}

// User Reputation Model
export class UserReputation {
    static collection = 'user_reputation';

    static async getOrCreate(userId) {
        const doc = await db.collection(this.collection).doc(userId).get();
        
        if (doc.exists) {
            return { id: doc.id, ...doc.data() };
        }

        const reputationData = {
            userId,
            reputation: 0,
            badges: [],
            postsCount: 0,
            commentsCount: 0,
            acceptedAnswers: 0,
            expertiseAreas: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.collection(this.collection).doc(userId).set(reputationData);
        return { id: userId, ...reputationData };
    }

    static async updateReputation(userId, points) {
        // Use set with merge to create document if it doesn't exist
        const docRef = db.collection(this.collection).doc(userId);
        const doc = await docRef.get();
        
        if (doc.exists) {
            // Document exists, use increment
            await docRef.update({
                reputation: FieldValue.increment(points),
                updatedAt: new Date(),
            });
        } else {
            // Document doesn't exist, create it
            await docRef.set({
                userId,
                reputation: points,
                badges: [],
                postsCount: 0,
                commentsCount: 0,
                acceptedAnswers: 0,
                expertiseAreas: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
    }

    static async incrementPostCount(userId) {
        const docRef = db.collection(this.collection).doc(userId);
        const doc = await docRef.get();
        
        if (doc.exists) {
            await docRef.update({
                postsCount: FieldValue.increment(1),
                updatedAt: new Date(),
            });
        } else {
            await docRef.set({
                userId,
                reputation: 0,
                badges: [],
                postsCount: 1,
                commentsCount: 0,
                acceptedAnswers: 0,
                expertiseAreas: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
    }

    static async incrementCommentCount(userId) {
        const docRef = db.collection(this.collection).doc(userId);
        const doc = await docRef.get();
        
        if (doc.exists) {
            await docRef.update({
                commentsCount: FieldValue.increment(1),
                updatedAt: new Date(),
            });
        } else {
            await docRef.set({
                userId,
                reputation: 0,
                badges: [],
                postsCount: 0,
                commentsCount: 1,
                acceptedAnswers: 0,
                expertiseAreas: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
    }

    static async addBadge(userId, badge) {
        await db.collection(this.collection).doc(userId).update({
            badges: FieldValue.arrayUnion(badge),
            updatedAt: new Date(),
        });
    }
}
