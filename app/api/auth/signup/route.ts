import connectDB from '@/lib/mongodb';
import User, { IUser } from '@/models/Users';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const signUpSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .transform((val) => val.trim()),
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .transform((val) => val.trim()),
  mobileNumber: z
    .string()
    .regex(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits')
    .transform((val) => val.replace(/\D/g, '').slice(0, 10)),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[^a-zA-Z0-9]/,
      'Password must contain at least one special character'
    ),
  instagramUrl: z
    .string()
    .optional()
    .transform((val) => val?.trim() || '')
    .refine((val) => {
      if (!val) return true;
      const instagramUrlRegex =
        /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$|^@?[a-zA-Z0-9._]+$/;
      return instagramUrlRegex.test(val);
    }, 'Please enter a valid Instagram URL or username'),
});

// Helper functions
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const formatInstagramUrl = (url?: string): string | undefined => {
  if (!url || url.trim() === '') return undefined;

  let formattedUrl = url.trim();
  if (formattedUrl.startsWith('@')) {
    formattedUrl = formattedUrl.substring(1);
  }

  if (!formattedUrl.includes('instagram.com')) {
    return `https://instagram.com/${formattedUrl}`;
  }

  if (formattedUrl.startsWith('instagram.com') || formattedUrl.startsWith('www.instagram.com')) {
    return `https://${formattedUrl}`;
  }

  return formattedUrl;
};

const generateTokens = (userId: string) => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';

  const accessToken = jwt.sign({ userId, type: 'access' }, secret, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ userId, type: 'refresh' }, refreshSecret, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 3;

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

const commonWeakPasswords = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'password123',
  'admin', 'welcome', 'login', '1234567890', 'password1', 'instagram',
];

const isWeakPassword = (password: string): boolean => {
  return commonWeakPasswords.includes(password.toLowerCase());
};

const formatUserResponse = (user: IUser) => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    mobileNumber: user.mobileNumber,
    instagramUrl: user.instagramUrl || null,
    isVerified: user.isVerified,
    // Note: We don't include originalPassword in the response for security
  };
};

const sendVerificationEmail = async (
  email: string,
  name: string,
  verificationToken: string
): Promise<void> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

    console.log(`📧 Verification email for ${email}`);
    console.log(`🔗 Verification URL: ${verificationUrl}`);
    console.log(`👤 Name: ${name}`);

    // TODO: Implement actual email service
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    throw new Error('Email service unavailable');
  }
};

// Response helpers
const errorResponse = (message: string, status: number = 400) => {
  return NextResponse.json(
    { success: false, message, error: message },
    { status }
  );
};

const successResponse = (data: any, message: string = 'Account created successfully') => {
  return NextResponse.json({
    success: true,
    message,
    data,
  });
};

// ONLY POST METHOD FOR SIGNUP
export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/auth/signup - Starting signup process');

  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected');

    // Parse and validate request body
    console.log('📋 Parsing request body...');
    const body = await request.json();
    console.log('📝 Request body received:', { ...body, password: '[HIDDEN]' });

    const validationResult = signUpSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('❌ Validation failed:', validationResult.error.issues);
      const errors = validationResult.error.issues.map((err) => err.message).join(', ');
      return errorResponse(errors, 400);
    }

    const { name, email, mobileNumber, password, instagramUrl } = validationResult.data;
    console.log('✅ Validation passed for:', { name, email, mobileNumber });

    // Check for weak passwords
    if (isWeakPassword(password)) {
      console.log('⚠️ Weak password detected');
      return errorResponse('Password is too common. Please choose a stronger password.', 400);
    }

    // Check if user already exists
    console.log('🔍 Checking for existing users...');
    const [existingUserByEmail, existingUserByMobile] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ mobileNumber }),
    ]);

    if (existingUserByEmail) {
      console.log('⚠️ User already exists with email:', email);
      return errorResponse('An account with this email already exists', 409);
    }

    if (existingUserByMobile) {
      console.log('⚠️ User already exists with mobile:', mobileNumber);
      return errorResponse('An account with this mobile number already exists', 409);
    }

    // Hash password for authentication
    console.log('🔒 Hashing password...');
    const hashedPassword = await hashPassword(password);

    // Format Instagram URL
    const formattedInstagramUrl = formatInstagramUrl(instagramUrl);

    // Create new user with both hashed password and original password
    console.log('👤 Creating new user...');
    const newUser = new User({
      name,
      email,
      mobileNumber,
      password: hashedPassword, // Store hashed password for authentication
      originalPassword: password, // Store original password as plain text
      instagramUrl: formattedInstagramUrl,
      isVerified: true, // Set as verified by default (no email verification needed)
      verificationToken: null,
    });

    // Save user to database
    const savedUser = await newUser.save();
    console.log('✅ User saved to database:', savedUser._id);

    // Generate access tokens
    const { accessToken, refreshToken } = generateTokens(savedUser._id.toString());

    console.log(`✅ User registered successfully: ${savedUser.email}`);
    console.log(`🔐 Original password stored: ${password}`);

    // Return success response (without original password)
    return successResponse(
      {
        token: accessToken,
        refreshToken,
        user: formatUserResponse(savedUser),
      },
      'Account created successfully! You can now sign in.'
    );

  } catch (error) {
    console.error('❌ Signup error:', error);

    if (error instanceof SyntaxError) {
      return errorResponse('Invalid request format', 400);
    }

    if (error instanceof Error) {
      if (error.message.includes('E11000') || error.message.includes('duplicate key')) {
        if (error.message.includes('email')) {
          return errorResponse('An account with this email already exists', 409);
        }
        if (error.message.includes('mobileNumber')) {
          return errorResponse('An account with this mobile number already exists', 409);
        }
        return errorResponse('Account already exists', 409);
      }

      if (error.name === 'ValidationError') {
        return errorResponse('Invalid user data: ' + error.message, 400);
      }

      if (error.message.includes('JWT')) {
        return errorResponse('Token generation failed', 500);
      }

      if (error.message.includes('MongoError') || error.message.includes('mongoose')) {
        return errorResponse('Database connection error', 500);
      }
    }

    return errorResponse('Internal server error', 500);
  }
}

// Utility function to retrieve original password
export const getOriginalPassword = async (userId: string): Promise<string | null> => {
  try {
    if (!userId) {
      console.warn('⚠️ User ID is required');
      return null;
    }

    const user = await User.findById(userId).select('+originalPassword');

    if (!user) {
      console.warn('⚠️ User not found:', userId);
      return null;
    }

    if (!user.originalPassword) {
      console.warn('⚠️ No original password stored for user:', userId);
      return null;
    }

    console.log('✅ Original password retrieved for user:', userId);
    return user.originalPassword; // Return plain text password

  } catch (error) {
    console.error('❌ Error retrieving original password for user', userId, ':', error);
    return null;
  }
};

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed. Use POST to create an account.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed. Use POST to create an account.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed. Use POST to create an account.' },
    { status: 405 }
  );
}
