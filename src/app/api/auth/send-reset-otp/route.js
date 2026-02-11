import { NextResponse } from 'next/server';
import { User } from '@/models/user.model.js';
import { generateOTP } from '@/utils/otp.utils';
import { sendEmail } from '@/utils/email.utils';
import { getResetPasswordEmailHtml } from '@/utils/email-templates';

export async function POST(req) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }
    
    const normalized = email?.toLowerCase?.() || '';
    
    // 1. Find User
    const user = await User.findOne({ email: normalized });
    if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 2. CHECK PROVIDER (Crucial Step)
    // Only allow "local" users to reset passwords. 
    // Google users don't have passwords stored in your DB.
    if (user.provider !== 'local' && !user.provider.includes('local')) {
      return NextResponse.json({ 
        message: `This account uses ${user.provider} login. Please sign in with ${user.provider}.` 
      }, { status: 400 });
    }

    // 3. Generate OTP
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    // 4. Update User in Firestore
    await User.update(user.id, {
      resetOtp: otp,
      resetOtpExpiry: expiry,
    });

    // 5. Send Email
    const emailHtml = getResetPasswordEmailHtml(otp);

    // Note: ensure sendEmail arguments match your utils/email.utils.js definition
    await sendEmail({
      to: user.email,
      subject: 'Reset Your Password - Legal Advisor',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`, // Fallback text
      html: emailHtml // HTML content
    });

    return NextResponse.json({ message: 'OTP sent to email' }, { status: 200 });

  } catch (err) {
    console.error('Send OTP error', err);
    return NextResponse.json({ message: 'Failed to send OTP' }, { status: 500 });
  }
}