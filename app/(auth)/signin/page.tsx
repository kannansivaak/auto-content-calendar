'use client';
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import {
  Sparkles,
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// TypeScript types matching your API response
interface SignInFormData {
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

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: SignInResponseData;
  error?: string;
}

// Utility functions for cookie management
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
};

const clearAuthCookies = () => {
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
};

interface SignInPageProps {}

const SignInPage: React.FC<SignInPageProps> = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    reset
  } = useForm<SignInFormData>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Watch form values for real-time validation
  const watchedFields = watch();

  // Validation rules
  const validationRules = {
    email: {
      required: 'Email is required',
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      }
    },
    password: {
      required: 'Password is required',
      minLength: {
        value: 6,
        message: 'Password must be at least 6 characters'
      }
    }
  };

  // API function to call your actual signin endpoint
  const signInAPI = async (credentials: SignInFormData): Promise<ApiResponse> => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Sign in failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please try again.');
    }
  };

  // Form submission handler
  const onSubmit: SubmitHandler<SignInFormData> = async (data) => {
    setSubmitError('');
    setIsLoading(true);

    try {
      const response = await signInAPI(data);

      if (response.success && response.data) {
        console.log('Sign In Success:', response.data);

        // Store auth tokens in cookies (not localStorage)
        setCookie('token', response.data.token, 1); // 1 day for access token
        setCookie('refreshToken', response.data.refreshToken, 7); // 7 days for refresh token

        // Store user data in localStorage for client-side use
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Reset form on success
        reset();

        // Handle different user states
        if (!response.data.user.isVerified) {
          // User needs to verify email
          setSubmitError('Please check your email and verify your account before signing in.');
          // Clear cookies since user is not verified
          clearAuthCookies();
          return;
        } else {
          // User is verified, redirect to dashboard
          console.log('✅ Redirecting to dashboard...');

          // Small delay to ensure cookies are set
          setTimeout(() => {
            router.push('/home');
            router.refresh(); // Force a refresh to trigger middleware
          }, 100);
        }
      } else {
        throw new Error(response.message || 'Sign in failed');
      }

    } catch (error) {
      console.error('Sign in error:', error);
      let errorMessage = 'Failed to sign in. Please try again.';

      if (error instanceof Error) {
        // Handle specific error messages from API
        if (error.message.includes('Invalid email or password')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.message.includes('verify your email')) {
          errorMessage = 'Please verify your email before signing in. Check your inbox for verification link.';
        } else if (error.message.includes('Too many login attempts')) {
          errorMessage = 'Too many login attempts. Please wait 15 minutes before trying again.';
        } else if (error.message.includes('Network error')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }

      setSubmitError(errorMessage);

      // Clear any cookies on error
      clearAuthCookies();
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form reset
  const handleReset = (): void => {
    reset();
    setSubmitError('');
  };

  // Handle navigation to signup
  const handleSignUpClick = () => {
    router.push('/signup');
  };

  return (
    <div className="min-h-screen gradient flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">Instagram AI</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/70">Sign in to your account to continue</p>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Global Error Message */}
            {submitError && (
              <div className="bg-red-500/20 border border-red-400 rounded-lg p-4" role="alert">
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{submitError}</span>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-white font-medium mb-2">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-white/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  {...register('email', validationRules.email)}
                  className={`w-full bg-white/5 border rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-colors ${
                    errors.email
                      ? 'border-red-400 focus:ring-red-400'
                      : watchedFields.email && !errors.email
                      ? 'border-green-400 focus:ring-green-400'
                      : 'border-white/20 focus:ring-purple-400'
                  }`}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <div className="flex items-center space-x-1 mt-2 text-red-400 text-sm" role="alert">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.email.message}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-white font-medium mb-2">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-white/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', validationRules.password)}
                  className={`w-full bg-white/5 border rounded-lg pl-10 pr-12 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-colors ${
                    errors.password
                      ? 'border-red-400 focus:ring-red-400'
                      : watchedFields.password && !errors.password
                      ? 'border-green-400 focus:ring-green-400'
                      : 'border-white/20 focus:ring-purple-400'
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center space-x-1 mt-2 text-red-400 text-sm" role="alert">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.password.message}</span>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex space-x-3">
              {/* Reset Button */}
              {isDirty && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isLoading}
                  className="flex-1 border border-white/20 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Reset
                </button>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !isValid}
                className={`${isDirty ? 'flex-1' : 'w-full'} bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </div>

            {/* Form Validation Status */}
            {isDirty && (
              <div className="text-center">
                <p className={`text-xs ${isValid ? 'text-green-400' : 'text-yellow-400'}`}>
                  {isValid ? 'Form is valid ✓' : 'Please fix the errors above'}
                </p>
              </div>
            )}

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="text-white/70">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={handleSignUpClick}
                  className="text-purple-300 hover:text-purple-200 font-semibold transition-colors"
                  disabled={isLoading}
                >
                  Create Account
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/50 text-xs">
            By signing in, you agree to our{' '}
            <button
              type="button"
              className="text-purple-300 hover:text-purple-200 transition-colors"
              onClick={() => router.push('/terms-condition')}
            >
              Terms of Service
            </button>{' '}
            and{' '}
            <button
              type="button"
              className="text-purple-300 hover:text-purple-200 transition-colors"
              onClick={() => router.push('/privacy-policy')}
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
