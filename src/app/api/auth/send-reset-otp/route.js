import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/user.model.js';
import { generateOTP } from '@/utils/otp.utils';
import { sendEmail } from '@/utils/email.utils';

export async function POST(req) {
  await dbConnect();
  try {
    const { email } = await req.json();
    const normalized = email?.toLowerCase?.() || '';
    const user = await User.findOne({ email: normalized });
    if (!user) return Response.json({ message: 'User not found' }, { status: 404 });

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await User.update(user.id, {
      resetOtp: otp,
      resetOtpExpiry: expiry,
    });

    await sendEmail(user.email, 'Password Reset OTP', `Your OTP is ${otp}. It expires in 10 minutes.`);

    return Response.json({ message: 'OTP sent to email' }, { status: 200 });
  } catch (err) {
    console.error('Send OTP error', err);
    return Response.json({ message: 'Failed to send OTP' }, { status: 500 });
  }
}
