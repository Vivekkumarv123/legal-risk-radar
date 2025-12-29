    import dbConnect from '@/lib/dbConnect';
    import { OAuth2Client } from 'google-auth-library';
    import User from '@/models/User';
    import { generateAccessToken, generateRefreshToken } from '@/utils/token.utils';

    const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID);

    function buildSetCookie(token) {
    const secure = process.env.NODE_ENV === 'production';
    const maxAge = 7 * 24 * 60 * 60; // 7 days
    return `refreshToken=${token}; Path=/; HttpOnly; Max-Age=${maxAge}; SameSite=None; ${secure ? 'Secure;' : ''}`;
    }

    export async function POST(req) {
    await dbConnect();
    try {
        const { idToken } = await req.json();
        if (!idToken) return Response.json({ message: 'ID token required' }, { status: 400 });

        const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_WEB_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) return Response.json({ message: 'Invalid token payload' }, { status: 401 });
        if (!payload.email_verified) return Response.json({ message: 'Email not verified by Google' }, { status: 401 });

        const email = payload.email.toLowerCase();
        let user = await User.findOne({ email });
        if (!user) {
        user = await User.create({ name: payload.name, email, avatar: payload.picture, provider: 'google', role: 'user' });
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save();

        const headers = { 'Content-Type': 'application/json', 'Set-Cookie': buildSetCookie(refreshToken) };
        return new Response(JSON.stringify({ message: 'Google login successful', accessToken }), { status: 200, headers });
    } catch (err) {
        console.error('Google login error', err);
        return Response.json({ message: 'Google authentication failed' }, { status: 401 });
    }
    }
