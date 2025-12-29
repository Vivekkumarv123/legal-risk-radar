import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '@/utils/token.utils';

function buildSetCookie(token) {
  const secure = process.env.NODE_ENV === 'production';
  const maxAge = 7 * 24 * 60 * 60; // 7 days
  return `refreshToken=${token}; Path=/; HttpOnly; Max-Age=${maxAge}; SameSite=None; ${secure ? 'Secure;' : ''}`;
}

export async function POST(req) {
  await dbConnect();
  try {
    const { email, password } = await req.json();
    if (!email || !password) return Response.json({ message: 'Email and password are required' }, { status: 400 });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.provider !== 'local') return Response.json({ message: 'Invalid credentials' }, { status: 400 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return Response.json({ message: 'Invalid credentials' }, { status: 400 });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    const headers = { 'Content-Type': 'application/json', 'Set-Cookie': buildSetCookie(refreshToken) };

    return new Response(JSON.stringify({ message: 'Login successful', accessToken }), { status: 200, headers });
  } catch (err) {
    console.error('Login error', err);
    return Response.json({ message: 'Login failed' }, { status: 500 });
  }
}
