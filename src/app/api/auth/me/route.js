import dbConnect from '@/lib/dbConnect';
import jwt from 'jsonwebtoken';
import User from '@/models/user.model.js';

export async function GET(req) {
  await dbConnect();
  try {
    const auth = req.headers.get('authorization') || '';
    if (!auth.startsWith('Bearer ')) return Response.json({ message: 'Unauthorized' }, { status: 401 });
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) return Response.json({ message: 'Invalid token' }, { status: 401 });

    const user = await User.findById(decoded.id).select('name email role avatar provider');
    if (!user) return Response.json({ message: 'User not found' }, { status: 404 });

    return Response.json({ success: true, user }, { status: 200 });
  } catch (err) {
    console.error('Me error', err);
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }
}
