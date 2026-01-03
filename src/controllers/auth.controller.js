import { User } from "@/models/user.model.js"; // Our new Firestore Model
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { sendEmail } from "@/utils/email.utils";
import { generatePassword } from "@/utils/password.utils";
import { generateOTP } from "@/utils/otp.utils";
import { generateAccessToken, generateRefreshToken } from "@/utils/token.utils";
import { getSignupEmailHtml, getGoogleSignupEmailHtml, getGoogleSignupEmailText } from "@/utils/email-templates";

const googleClient = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

export const authController = {
  // 1. SIGNUP
  async signup({ name, email }) {
    if (!name || !email) throw new Error("Name and email are required");

    const normalizedEmail = email.toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) throw new Error("User already exists");

    const rawPassword = generatePassword(name);
    const hashedPassword = await bcrypt.hash(rawPassword, 8);

    await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      provider: "local",
      role: "user",
    });

    // Generate the professional HTML content
    const emailHtml = getSignupEmailHtml(name, normalizedEmail, rawPassword);

    // Send email asynchronously using the object syntax
    sendEmail({
      to: normalizedEmail,
      subject: "Welcome to Legal Advisor - Your Credentials",
      html: emailHtml, // Pass the HTML here
      text: `Hello ${name},\n\nEmail: ${normalizedEmail}\nPassword: ${rawPassword}\n\nPlease change your password after login.` // Fallback text
    }).catch((err) => console.error("Email error:", err));

    return { message: "Signup successful. Password will be sent to your email." };
  },

  // 2. LOGIN
  async login({ email, password }) {
    if (!email || !password) throw new Error("Email and password are required");

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.provider !== "local") throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // ✅ FIX 2: Use Model.update(), not user.save()
    await User.update(user.id, { refreshToken });

    return { accessToken, refreshToken, message: "Login successful" };
  },

  // 3. GOOGLE LOGIN
  async googleLogin({ idToken }) {
    if (!idToken) throw new Error("ID token required");

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_WEB_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload.email_verified) {
      throw new Error("Email not verified by Google");
    }

    const email = payload.email.toLowerCase();
    let user = await User.findOne({ email });
    let isFirstGoogleSignup = false;
    if (!user) {
      // First-time Google user
      user = await User.create({
        name: payload.name,
        email,
        avatar: payload.picture,
        provider: "google",
        role: "user",
      });
      isFirstGoogleSignup = true;
    } else {
      // 🔑 LINK GOOGLE to existing account
      if (!user.provider.includes("google")) {
        await User.update(user.id, {
          provider: user.provider === "local"
            ? "local,google"
            : "google",
          avatar: payload.picture || user.avatar,
        });
      }
    }

    if (isFirstGoogleSignup) {
      sendEmail({
        to: email,
        subject: "Welcome to Legal Advisor",
        html: getGoogleSignupEmailHtml(payload.name, email),
        text: getGoogleSignupEmailText(payload.name, email),
      }).catch(err => console.error("Google signup email error:", err));
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await User.update(user.id, { refreshToken });

    return {
      accessToken,
      refreshToken,
      message: "Google login successful",
    };
  },


  // 4. REFRESH TOKEN
  async refreshAccessToken(tokenFromCookie) {
    if (!tokenFromCookie) throw new Error("Refresh token required");

    const user = await User.findOne({ refreshToken: tokenFromCookie });
    if (!user) throw new Error("Invalid refresh token");

    try {
      const decoded = jwt.verify(tokenFromCookie, process.env.JWT_REFRESH_SECRET);
      if (!decoded.id) throw new Error("Invalid token payload");

      const newAccessToken = generateAccessToken(decoded.id);
      return { accessToken: newAccessToken };
    } catch (err) {
      throw new Error("Invalid or expired refresh token");
    }
  },

  // 5. LOGOUT
  async logout(userId) {
    if (!userId) throw new Error("User not authenticated");
    await User.update(userId, { refreshToken: null });
    return { message: "Logout successful" };
  },

  // 6. SEND RESET OTP
  async sendResetOtp({ email }) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new Error("User not found");

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await User.update(user.id, {
      resetOtp: otp,
      resetOtpExpiry: expiry
    });

    await sendEmail(user.email, "Password Reset OTP", `Your OTP is ${otp}. It expires in 10 minutes.`);
    return { message: "OTP sent to email" };
  },

  // 7. RESET PASSWORD
  async resetPasswordWithOtp({ email, otp, newPassword, confirmPassword }) {
    if (newPassword !== confirmPassword) throw new Error("Passwords do not match");

    const user = await User.findOne({ email: email.toLowerCase() });

    const now = new Date();
    // Check fields securely
    if (!user || String(user.resetOtp) !== String(otp) || !user.resetOtpExpiry || user.resetOtpExpiry < now) {
      throw new Error("Invalid or expired OTP");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.update(user.id, {
      password: hashedPassword,
      resetOtp: null,
      resetOtpExpiry: null
    });

    return { message: "Password reset successful. Please login." };
  },

  // 8. GET PROFILE
  async getMyProfile(userId) {
    if (!userId) throw new Error("Not authenticated");

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        provider: user.provider
      }
    };
  }
};