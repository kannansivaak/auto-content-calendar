import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import User, { IUser } from '@/models/Users';

// Validation schema
const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Type definitions
interface SignInRequest {
  email: string;
  password: string;
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  instagramUrl?: string | null;
  isVerified: boolean;
}

interface SignInResponseData {
  token: string;
  refreshToken: string;
  user: UserResponse;
}

interface SignInResponse {
  success: boolean;
  message: string;
  data?: SignInResponseData;
  error?: string;
}

// Helper function to get client IP
// const getClientIP = (request: NextRequest): string => {
//   // Try multiple headers to get the real IP
//   const forwarded = request.headers.get('x-forwarded-for');
//   const realIP = request.headers.get('x-real-ip');
//   const cfConnectingIP = request.headers.get('cf-connecting-ip');

//   if (forwarded !== null && forwarded !== undefined) { // Explicit null/undefined check
//   const trimmed = forwarded.trim();                  // TypeScript knows it's string
//   if (trimmed.length > 0) {                         // Explicit length check
//     return trimmed.split(',')[0].trim();             // ✅ Fully type-safe
//   }
// }
//   if (realIP) {
//     return realIP;
//   }
//   if (cfConnectingIP) {
//     return cfConnectingIP;
//   }

//   return 'unknown';
// };

// Helper function to generate JWT tokens
const generateTokens = (userId: string) => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';

  const accessToken = jwt.sign(
    { userId, type: 'access' },
    secret,
    { expiresIn: '15m' } // Short-lived access token
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    refreshSecret,
    { expiresIn: '7d' } // Long-lived refresh token
  );

  return { accessToken, refreshToken };
};

// Helper function to validate password
const validatePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Rate limiting helper (In production, use Redis or external service)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5; // 5 attempts per window

  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
};

// Helper function to format user response
const formatUserResponse = (user: IUser): UserResponse => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    mobileNumber: user.mobileNumber,
    instagramUrl: user.instagramUrl || null,
    isVerified: user.isVerified
  };
};

// Error response helper
const errorResponse = (message: string, status: number = 400): NextResponse<SignInResponse> => {
  return NextResponse.json(
    {
      success: false,
      message,
      error: message
    },
    { status }
  );
};

// Success response helper
const successResponse = (data: SignInResponseData, message: string = 'Sign in successful'): NextResponse<SignInResponse> => {
  return NextResponse.json({
    success: true,
    message,
    data
  });
};

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Rate limiting
    // const ip = getClientIP(request);
    // if (!checkRateLimit(ip)) {
    //   return errorResponse('Too many login attempts. Please try again later.', 429);
    // }

    // Parse request body
    const body: SignInRequest = await request.json();

    // Validate input
    const validationResult = signInSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => err.message).join(', ');
      return errorResponse(`Validation error: ${errors}`);
    }

    const { email, password } = validationResult.data;

    // Find user by email using static method
    const user: IUser | null = await User.findByEmail(email);
    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Check if user is verified
    if (!user.isVerified) {
      return errorResponse('Please verify your email before signing in. Check your inbox for verification link.', 403);
    }

    // Validate password
    const isPasswordValid = await validatePassword(password, user.password);
    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401);
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    // Update last login
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date()
    });

    // Log successful login
    console.log(`✅ User signed in: ${user.email} (ID: ${user._id})`);

    // Format user response
    const userResponse = formatUserResponse(user);

    // Return success response
    return successResponse({
      token: accessToken,
      refreshToken,
      user: userResponse
    });

  } catch (error) {
    console.error('❌ Sign in error:', error);

    // Handle specific errors
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body');
    }

    if (error instanceof Error) {
      if (error.message.includes('JWT')) {
        return errorResponse('Authentication token generation failed', 500);
      }

      if (error.message.includes('MongoError') || error.message.includes('mongoose')) {
        return errorResponse('Database connection error', 500);
      }
    }

    return errorResponse('Internal server error', 500);
  }
}

// Token refresh endpoint
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return errorResponse('Refresh token is required');
    }

    // Verify refresh token
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
    const decoded = jwt.verify(refreshToken, refreshSecret) as { userId: string; type: string };

    if (decoded.type !== 'refresh') {
      return errorResponse('Invalid refresh token');
    }

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    if (!user.isVerified) {
      return errorResponse('User account not verified', 403);
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString());

    return NextResponse.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        token: accessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error('❌ Token refresh error:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      return errorResponse('Invalid or expired refresh token', 401);
    }

    return errorResponse('Token refresh failed', 500);
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  );
}
