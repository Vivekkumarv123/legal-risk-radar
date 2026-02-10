import { User } from "@/models/user.model.js"; // Our new Firestore Model
import { Subscription } from "@/models/subscription.model.js";
import { db } from "@/lib/firebaseAdmin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { sendEmail } from "@/utils/email.utils";
import { generatePassword } from "@/utils/password.utils";
import { generateOTP } from "@/utils/otp.utils";
import { generateAccessToken, generateRefreshToken } from "@/utils/token.utils";
import { getSignupEmailHtml, getGoogleSignupEmailHtml, getGoogleSignupEmailText } from "@/utils/email-templates";
import crypto from "crypto";

const googleClient = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

/**
 * Helper function to automatically subscribe new users to newsletter
 */
async function autoSubscribeToNewsletter(email, name) {
  try {
    const subscriptionsRef = db.collection('newsletterSubscriptions');
    
    // Check if already subscribed
    const existingSnapshot = await subscriptionsRef.where('email', '==', email).limit(1).get();
    
    if (existingSnapshot.empty) {
      // Create newsletter subscription
      const unsubscribeToken = crypto.randomBytes(32).toString('hex');
      await subscriptionsRef.add({
        email,
        name: name || '',
        categories: ['all'],
        frequency: 'daily', // Default to daily
        isActive: true,
        unsubscribeToken,
        subscribedAt: new Date(),
        lastSentAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`✅ Auto-subscribed ${email} to newsletter`);
    }
  } catch (error) {
    console.error('Failed to auto-subscribe to newsletter:', error);
    // Don't fail signup if newsletter subscription fails
  }
}

export const authController = {
  // 1. SIGNUP
  async signup({ name, email }) {
    if (!name || !email) throw new Error("Name and email are required");

    const normalizedEmail = email.toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) throw new Error("User already exists");

    const rawPassword = generatePassword(name);
    const hashedPassword = await bcrypt.hash(rawPassword, 8);

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      provider: "local",
      role: "user",
    });

    // ✅ CREATE DEFAULT BASIC SUBSCRIPTION FOR NEW USERS
    try {
      await Subscription.create({
        userId: newUser.id,
        planId: "basic",
        planName: "Basic",
        status: "active",
        price: 0,
        currency: "INR",
        features: {
          aiQueries: 5, // Daily limit
          documentAnalysis: true,
          voiceQueries: false,
          pdfReports: false,
          prioritySupport: false,
          apiAccess: false,
          teamCollaboration: 0,
          contractComparison: true,
          chromeExtension: false,
          newsletter: false,
        }
      });
    } catch (subErr) {
      console.error("Failed to create subscription for new user:", subErr);
      // Don't fail signup even if subscription creation fails
    }

    // ✅ AUTO-SUBSCRIBE TO NEWSLETTER
    await autoSubscribeToNewsletter(normalizedEmail, name);

    // Generate the professional HTML content
    const emailHtml = getSignupEmailHtml(name, normalizedEmail, rawPassword);

    // Send email asynchronously using the object syntax
    await sendEmail({
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

      // ✅ CREATE DEFAULT BASIC SUBSCRIPTION FOR NEW GOOGLE USERS
      try {
        await Subscription.create({
          userId: user.id,
          planId: "basic",
          planName: "Basic",
          status: "active",
          price: 0,
          currency: "INR",
          features: {
            aiQueries: 5, // Daily limit
            documentAnalysis: true,
            voiceQueries: false,
            pdfReports: false,
            prioritySupport: false,
            apiAccess: false,
            teamCollaboration: 0,
            contractComparison: true,
            chromeExtension: false,
            newsletter: false,
          }
        });
      } catch (subErr) {
        console.error("Failed to create subscription for new Google user:", subErr);
        // Don't fail login even if subscription creation fails
      }

      // ✅ AUTO-SUBSCRIBE TO NEWSLETTER
      await autoSubscribeToNewsletter(email, payload.name);
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
      await sendEmail({
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