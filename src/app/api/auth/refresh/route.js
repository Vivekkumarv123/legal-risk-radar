import dbConnect from '@/lib/dbConnect';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { generateAccessToken } from '@/utils/token.utils';

export async function POST(req) {
  await dbConnect();
  try {
    // read refresh token from cookies header
    const cookie = req.headers.get('cookie') || '';
    const match = cookie.match(/refreshToken=([^;]+)/);
    const refreshToken = match?.[1];
    if (!refreshToken) return Response.json({ message: 'Refresh token required' }, { status: 401 });

    const user = await User.findOne({ refreshToken });
    if (!user) return Response.json({ message: 'Invalid refresh token' }, { status: 403 });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    if (!decoded?.id) return Response.json({ message: 'Invalid token payload' }, { status: 403 });

    const newAccessToken = generateAccessToken(decoded.id);
    return Response.json({ accessToken: newAccessToken }, { status: 200 });
  } catch (err) {
    console.error('Refresh error', err);
    return Response.json({ message: 'Invalid or expired refresh token' }, { status: 401 });
  }
}
