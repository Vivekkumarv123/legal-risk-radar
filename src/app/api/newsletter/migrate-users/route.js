import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import crypto from 'crypto';

/**
 * One-time migration endpoint to subscribe all existing users to newsletter
 * Run this once after deployment to subscribe existing users
 * 
 * Usage: GET /api/newsletter/migrate-users
 */
export async function GET(request) {
    try {
        console.log('🔄 Starting newsletter migration for existing users...');

        // Get all users from Firestore
        const usersSnapshot = await db.collection('users').get();
        
        if (usersSnapshot.empty) {
            return NextResponse.json({
                success: true,
                message: 'No users found to migrate',
                stats: {
                    totalUsers: 0,
                    alreadySubscribed: 0,
                    newSubscriptions: 0,
                    failed: 0
                }
            });
        }

        const users = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`Found ${users.length} users to process`);

        const subscriptionsRef = db.collection('newsletterSubscriptions');
        let alreadySubscribed = 0;
        let newSubscriptions = 0;
        let failed = 0;

        // Process each user
        for (const user of users) {
            try {
                // Skip if no email
                if (!user.email) {
                    console.log(`⚠️  Skipping user ${user.id} - no email`);
                    failed++;
                    continue;
                }

                // Check if already subscribed
                const existingSnapshot = await subscriptionsRef
                    .where('email', '==', user.email)
                    .limit(1)
                    .get();

                if (!existingSnapshot.empty) {
                    console.log(`✓ User ${user.email} already subscribed`);
                    alreadySubscribed++;
                    continue;
                }

                // Create newsletter subscription
                const unsubscribeToken = crypto.randomBytes(32).toString('hex');
                await subscriptionsRef.add({
                    email: user.email,
                    name: user.name || '',
                    categories: ['all'],
                    frequency: 'daily',
                    isActive: true,
                    unsubscribeToken,
                    subscribedAt: new Date(),
                    lastSentAt: null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                console.log(`✅ Subscribed ${user.email} to newsletter`);
                newSubscriptions++;

            } catch (error) {
                console.error(`❌ Failed to subscribe ${user.email}:`, error);
                failed++;
            }
        }

        const stats = {
            totalUsers: users.length,
            alreadySubscribed,
            newSubscriptions,
            failed
        };

        console.log('📊 Migration complete:', stats);

        return NextResponse.json({
            success: true,
            message: 'Newsletter migration completed',
            stats
        });

    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message,
                message: 'Failed to migrate users to newsletter'
            },
            { status: 500 }
        );
    }
}
