import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import User from "../models/User.js";
import { sendEmail } from "../utils/email.utils.js";
import { generatePassword } from "../utils/password.utils.js";
import { generateOTP } from "../utils/otp.utils.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.utils.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

export const signup = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email)
      return res.status(400).json({ message: "Name and email are required" });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const rawPassword = generatePassword(name);
    const hashedPassword = await bcrypt.hash(rawPassword, 8);

    await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      provider: "local",
      role: "user",
    });

    sendEmail(
      email,
      "Your Account Password",
      `Hello ${name},\n\nEmail: ${email}\nPassword: ${rawPassword}\n\nPlease change your password after login.`
    ).catch((err) => console.error("Email error:", err?.message || err));

    return res.status(201).json({ message: "Signup successful. Password will be sent to your email." });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || user.provider !== "local") return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(200).json({ message: "Login successful", accessToken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "ID token required" });

    const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_WEB_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload.email_verified) return res.status(401).json({ message: "Email not verified by Google" });

    const email = payload.email.toLowerCase();

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: payload.name,
        email,
        avatar: payload.picture,
        provider: "google",
        role: "user",
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(200).json({ message: "Google login successful", accessToken });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ message: "Google authentication failed" });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });

    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(403).json({ message: "Invalid refresh token" });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    if (!decoded.id) return res.status(403).json({ message: "Invalid token payload" });

    const newAccessToken = generateAccessToken(decoded.id);

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(400).json({ message: "User not authenticated" });

    await User.findByIdAndUpdate(userId, { refreshToken: null });

    res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "none" });

    res.status(200).json({ message: "Logout successful. Please clear token on client." });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Logout failed" });
  }
};

export const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();

    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(user.email, "Password Reset OTP", `Your OTP is ${otp}. It expires in 10 minutes.`);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || String(user.resetOtp) !== String(otp) || user.resetOtpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful. Please login." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Password reset failed" });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findById(userId).select("name email role avatar provider");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to get profile" });
  }
};

export default {
  signup,
  login,
  googleLogin,
  refreshAccessToken,
  logout,
  sendResetOtp,
  resetPasswordWithOtp,
  getMyProfile,
};
