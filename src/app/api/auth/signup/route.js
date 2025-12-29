import { NextResponse } from "next/server";
// Make sure this path matches your actual file name (e.g., authController.js or auth.controller.js)
import { authController } from "@/controllers/auth.controller.js"; 

export async function POST(req) {
  try {
    const body = await req.json();

    // ✅ FIX: Change .register() to .signup()
    const result = await authController.signup(body);

    return NextResponse.json(result, { status: 201 });

  } catch (err) {
    console.error('Signup error', err);

    const status = err.message === 'User already exists' ? 400 : 500;
    const message = err.message || 'Signup failed';

    return NextResponse.json({ message }, { status });
  }
}