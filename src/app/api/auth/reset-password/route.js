import dbConnect from '@/lib/dbConnect';
import User from '@/models/user.model.js';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  await dbConnect();
  try {
    const { email, otp, newPassword, confirmPassword } = await req.json();
    if (newPassword !== confirmPassword) return Response.json({ message: 'Passwords do not match' }, { status: 400 });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || String(user.resetOtp) !== String(otp) || user.resetOtpExpiry < Date.now()) {
      return Response.json({ message: 'Invalid or expired OTP' }, { status: 400 });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    return Response.json({ message: 'Password reset successful. Please login.' }, { status: 200 });
  } catch (err) {
    console.error('Reset password error', err);
    return Response.json({ message: 'Password reset failed' }, { status: 500 });
  }
}
