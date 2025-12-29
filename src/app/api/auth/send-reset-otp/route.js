import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateOTP } from '@/utils/otp.utils';
import { sendEmail } from '@/utils/email.utils';

export async function POST(req) {
  await dbConnect();
  try {
    const { email } = await req.json();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return Response.json({ message: 'User not found' }, { status: 404 });

    const otp = generateOTP();
    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(user.email, 'Password Reset OTP', `Your OTP is ${otp}. It expires in 10 minutes.`);

    return Response.json({ message: 'OTP sent to email' }, { status: 200 });
  } catch (err) {
    console.error('Send OTP error', err);
    return Response.json({ message: 'Failed to send OTP' }, { status: 500 });
  }
}
