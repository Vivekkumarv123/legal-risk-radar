import jwt from "jsonwebtoken";
import { User } from "@/models/user.model.js";

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization || req.get?.("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access token missing" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // normalize user id
    req.user = {
      userId: decoded.id,
    };

    if (!req.user.userId) {
      return res.status(401).json({ message: "User id missing in token" });
    }

    next();
  } catch (err) {
    console.error("JWT error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Next.js API route compatible auth verification
export const verifyToken = async (request) => {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'Access token missing' };
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return { success: false, error: 'Token not found' };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return { success: false, error: 'User ID missing in token' };
    }

    return {
      success: true,
      user: {
        uid: decoded.id,
        id: decoded.id
      }
    };

  } catch (error) {
    console.error('JWT verification error:', error);
    return { success: false, error: 'Invalid or expired token' };
  }
};

// Get full user details with token verification
export const verifyTokenWithUser = async (request) => {
  try {
    const authResult = await verifyToken(request);
    if (!authResult.success) {
      return authResult;
    }

    const user = await User.findById(authResult.user.id);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    return {
      success: true,
      user: {
        uid: user.id,
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role
      }
    };

  } catch (error) {
    console.error('JWT verification with user error:', error);
    return { success: false, error: 'Authentication failed' };
  }
};

export default protect;
