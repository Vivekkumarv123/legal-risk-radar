import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  await dbConnect();
  try {
    const auth = req.headers.get('authorization') || '';
    if (!auth.startsWith('Bearer ')) return Response.json({ message: 'Unauthorized' }, { status: 401 });
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) return Response.json({ message: 'Invalid token' }, { status: 401 });

    await User.findByIdAndUpdate(decoded.id, { refreshToken: null });

    const headers = { 'Set-Cookie': 'refreshToken=; Path=/; HttpOnly; Max-Age=0; SameSite=None;' };
    return new Response(JSON.stringify({ message: 'Logout successful' }), { status: 200, headers });
  } catch (err) {
    console.error('Logout error', err);
    return Response.json({ message: 'Logout failed' }, { status: 500 });
  }
}
