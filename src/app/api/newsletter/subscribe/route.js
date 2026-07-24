import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, name, categories, frequency } = body;

        // Validate email
        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email address' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if already subscribed using normalized email doc ID
        const subscriptionsRef = db.collection('newsletterSubscriptions');
        const docRef = subscriptionsRef.doc(normalizedEmail);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const existing = docSnap.data();

            if (existing.isActive) {
                return NextResponse.json(
                    { success: false, error: 'Email already subscribed' },
                    { status: 400 }
                );
            } else {
                // Reactivate subscription
                await docRef.update({
                    isActive: true,
                    name: name || existing.name,
                    categories: categories || existing.categories,
                    frequency: frequency || existing.frequency,
                    updatedAt: new Date()
                });

                return NextResponse.json({
                    success: true,
                    message: 'Subscription reactivated successfully',
                    subscription: {
                        email: normalizedEmail,
                        name: name || existing.name,
                        frequency: frequency || existing.frequency,
                        categories: categories || existing.categories
                    }
                });
            }
        }

        // Create new subscription using normalizedEmail as Document ID
        const unsubscribeToken = crypto.randomBytes(32).toString('hex');
        const newSubscription = {
            email: normalizedEmail,
            name: name || '',
            categories: categories || ['all'],
            frequency: frequency || 'daily',
            isActive: true,
            unsubscribeToken,
            subscribedAt: new Date(),
            lastSentAt: null,
            lastNewsletterDate: null,
            lastWeeklyNewsletterDate: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await docRef.set(newSubscription);

        return NextResponse.json({
            success: true,
            message: 'Successfully subscribed to newsletter',
            subscription: {
                email: newSubscription.email,
                name: newSubscription.name,
                frequency: newSubscription.frequency,
                categories: newSubscription.categories
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to subscribe' },
            { status: 500 }
        );
    }
}

// Get subscription status
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const rawEmail = searchParams.get('email');

        if (!rawEmail) {
            return NextResponse.json(
                { success: false, error: 'Email required' },
                { status: 400 }
            );
        }

        const normalizedEmail = rawEmail.toLowerCase().trim();
        const docRef = db.collection('newsletterSubscriptions').doc(normalizedEmail);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({
                success: true,
                subscribed: false
            });
        }

        const subscription = docSnap.data();

        return NextResponse.json({
            success: true,
            subscribed: subscription.isActive,
            subscription: {
                email: subscription.email,
                name: subscription.name,
                frequency: subscription.frequency,
                categories: subscription.categories,
                subscribedAt: subscription.subscribedAt
            }
        });

    } catch (error) {
        console.error('Get subscription error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get subscription status' },
            { status: 500 }
        );
    }
}

