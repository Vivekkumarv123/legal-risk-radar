import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/user.model.js';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  await dbConnect();
  try {
    const { email, otp, newPassword, confirmPassword } = await req.json();
    if (newPassword !== confirmPassword) return Response.json({ message: 'Passwords do not match' }, { status: 400 });

    const normalized = email?.toLowerCase?.() || '';
    const user = await User.findOne({ email: normalized });
    const now = Date.now();
    const expiry = user?.resetOtpExpiry ? (user.resetOtpExpiry.getTime ? user.resetOtpExpiry.getTime() : new Date(user.resetOtpExpiry).getTime()) : 0;

    if (!user || !user.resetOtp || String(user.resetOtp) !== String(otp) || expiry < now) {
      return Response.json({ message: 'Invalid or expired OTP' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await User.update(user.id, {
      password: hashed,
      resetOtp: null,
      resetOtpExpiry: null,
      // If this account was created via Google (provider === 'google'),
      // make it a local account now that a password exists so normal login works.
      provider: 'local',
    });

    return Response.json({ message: 'Password reset successful. Please login.' }, { status: 200 });
  } catch (err) {
    console.error('Reset password error', err);
    return Response.json({ message: 'Password reset failed' }, { status: 500 });
  }
}
