import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/utils/email.utils';
import { generatePassword } from '@/utils/password.utils';

export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();
    const { name, email, password } = body;
    if (!name || !email) return Response.json({ message: 'Name and email are required' }, { status: 400 });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return Response.json({ message: 'User already exists' }, { status: 400 });

    // allow explicit password or auto-generate
    const rawPassword = password || generatePassword(name);
    const hashedPassword = await bcrypt.hash(rawPassword, 8);

    await User.create({ name, email: email.toLowerCase(), password: hashedPassword, provider: 'local', role: 'user' });

    // send password email asynchronously
    sendEmail(email, 'Your Account Password', `Hello ${name},\n\nEmail: ${email}\nPassword: ${rawPassword}\n\nPlease change your password after login.`).catch(()=>{});

    return Response.json({ message: 'Signup successful. Password will be sent to your email.' }, { status: 201 });
  } catch (err) {
    console.error('Signup error', err);
    return Response.json({ message: 'Signup failed' }, { status: 500 });
  }
}
