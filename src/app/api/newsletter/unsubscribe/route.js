import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Unsubscribe token required' },
                { status: 400 }
            );
        }

        // Query Firestore for subscription by unsubscribe token
        const subscriptionsRef = db.collection('newsletterSubscriptions');
        const snapshot = await subscriptionsRef.where('unsubscribeToken', '==', token).limit(1).get();

        if (snapshot.empty) {
            return NextResponse.json(
                { success: false, error: 'Invalid unsubscribe token' },
                { status: 404 }
            );
        }

        // Update subscription to inactive
        const docRef = snapshot.docs[0].ref;
        await docRef.update({
            isActive: false,
            updatedAt: new Date()
        });

        // Return HTML page for better UX
        return new NextResponse(
            `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Unsubscribed</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }
                    .container {
                        background: white;
                        padding: 40px;
                        border-radius: 12px;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                        text-align: center;
                        max-width: 500px;
                    }
                    h1 {
                        color: #333;
                        margin-bottom: 20px;
                    }
                    p {
                        color: #666;
                        line-height: 1.6;
                        margin-bottom: 30px;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 30px;
                        background: #2563eb;
                        color: white;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: 600;
                        transition: background 0.3s;
                    }
                    .button:hover {
                        background: #1e40af;
                    }
                    .icon {
                        font-size: 48px;
                        margin-bottom: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="icon">✅</div>
                    <h1>Successfully Unsubscribed</h1>
                    <p>You have been unsubscribed from the LegalAdvisor newsletter.</p>
                    <p>We're sorry to see you go! If you change your mind, you can always subscribe again.</p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="button">
                        Return to LegalAdvisor
                    </a>
                </div>
            </body>
            </html>
            `,
            {
                status: 200,
                headers: {
                    'Content-Type': 'text/html',
                },
            }
        );

    } catch (error) {
        console.error('Unsubscribe error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to unsubscribe' },
            { status: 500 }
        );
    }
}

// POST method for API unsubscribe
export async function POST(request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email required' },
                { status: 400 }
            );
        }

        // Query Firestore for subscription by email
        const subscriptionsRef = db.collection('newsletterSubscriptions');
        const snapshot = await subscriptionsRef.where('email', '==', email).limit(1).get();

        if (snapshot.empty) {
            return NextResponse.json(
                { success: false, error: 'Subscription not found' },
                { status: 404 }
            );
        }

        // Update subscription to inactive
        const docRef = snapshot.docs[0].ref;
        await docRef.update({
            isActive: false,
            updatedAt: new Date()
        });

        return NextResponse.json({
            success: true,
            message: 'Successfully unsubscribed from newsletter'
        });

    } catch (error) {
        console.error('Unsubscribe error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to unsubscribe' },
            { status: 500 }
        );
    }
}
