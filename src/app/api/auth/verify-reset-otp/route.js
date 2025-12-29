import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/user.model.js';

export async function POST(req) {
  await dbConnect();
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) return Response.json({ message: 'Email and OTP required' }, { status: 400 });


    const normalized = email?.toLowerCase?.() || '';
    const user = await User.findOne({ email: normalized });
    if (!user) return Response.json({ message: 'User not found' }, { status: 404 });

    const now = Date.now();
    const expiry = user.resetOtpExpiry ? (user.resetOtpExpiry.getTime ? user.resetOtpExpiry.getTime() : new Date(user.resetOtpExpiry).getTime()) : 0;

    if (!user.resetOtp || String(user.resetOtp) !== String(otp) || expiry < now) {
      return Response.json({ message: 'Invalid or expired OTP' }, { status: 400 });
    }

    return Response.json({ message: 'OTP valid' }, { status: 200 });
  } catch (err) {
    console.error('Verify OTP error', err);
    return Response.json({ message: 'Failed to verify OTP' }, { status: 500 });
  }
}
