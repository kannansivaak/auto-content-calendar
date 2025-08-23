'use client';
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Info,
  Lock,
  Mail,
  Phone,
  Sparkles,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

// TypeScript types
interface SignUpFormData {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  instagramUrl?: string;
  agreeToTerms: boolean;
}

interface PasswordStrength {
  score: number;
  level: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
  color: string;
  textColor: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    refreshToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      mobileNumber: string;
      instagramUrl?: string | null;
      isVerified: boolean;
    };
  };
  error?: string;
}

// Utility functions for cookie management
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
};

const clearAuthCookies = () => {
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  document.cookie =
    'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
};

interface SignUpPageProps {}

const SignUpPage: React.FC<SignUpPageProps> = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const router = useRouter();

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    reset,
    setValue,
  } = useForm<SignUpFormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      mobileNumber: '',
      password: '',
      confirmPassword: '',
      instagramUrl: '',
      agreeToTerms: false,
    },
  });

  // Watch form values for real-time validation
  const watchedFields = watch();
  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');

  // Validation rules
  const validationRules = {
    name: {
      required: 'Full name is required',
      minLength: {
        value: 2,
        message: 'Name must be at least 2 characters',
      },
      maxLength: {
        value: 50,
        message: 'Name must be less than 50 characters',
      },
      pattern: {
        value: /^[a-zA-Z\s]+$/,
        message: 'Name can only contain letters and spaces',
      },
    },
    email: {
      required: 'Email is required',
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address',
      },
    },
    mobileNumber: {
      required: 'Mobile number is required',
      pattern: {
        value: /^[0-9]{10}$/,
        message: 'Please enter a valid 10-digit mobile number',
      },
    },
    instagramUrl: {
      pattern: {
        value:
          /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$|^@?[a-zA-Z0-9._]+$/,
        message: 'Please enter a valid Instagram URL or username',
      },
    },
    password: {
      required: 'Password is required',
      minLength: {
        value: 8,
        message: 'Password must be at least 8 characters',
      },
      validate: (value: string) => {
        const strength = calculatePasswordStrength(value);
        return strength.score >= 2 || 'Password is too weak';
      },
    },
    confirmPassword: {
      required: 'Please confirm your password',
      validate: (value: string) => {
        return value === passwordValue || 'Passwords do not match';
      },
    },
    agreeToTerms: {
      required: 'You must agree to the terms and conditions',
    },
  };

  // Password strength calculation
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (!password) {
      return {
        score: 0,
        level: 'weak',
        feedback: [],
        color: 'bg-gray-300',
        textColor: 'text-gray-400',
      };
    }

    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) {
      score += 1;
      feedback.push('At least 8 characters ✓');
    } else {
      feedback.push('At least 8 characters required');
    }

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
      score += 1;
      feedback.push('Mixed case letters ✓');
    } else {
      feedback.push('Use both uppercase and lowercase');
    }

    if (/\d/.test(password)) {
      score += 1;
      feedback.push('Contains numbers ✓');
    } else {
      feedback.push('Add numbers');
    }

    if (/[^a-zA-Z0-9]/.test(password)) {
      score += 1;
      feedback.push('Special characters ✓');
    } else {
      feedback.push('Add special characters');
    }

    let level: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
    let color = 'bg-red-500';
    let textColor = 'text-red-400';

    if (score === 2) {
      level = 'fair';
      color = 'bg-yellow-500';
      textColor = 'text-yellow-400';
    } else if (score === 3) {
      level = 'good';
      color = 'bg-blue-500';
      textColor = 'text-blue-400';
    } else if (score === 4) {
      level = 'strong';
      color = 'bg-green-500';
      textColor = 'text-green-400';
    }

    return { score, level, feedback, color, textColor };
  };

  // Memoized password strength
  const passwordStrength = useMemo<PasswordStrength>(() => {
    return calculatePasswordStrength(passwordValue);
  }, [passwordValue]);

  // API function to call your actual signup endpoint
  const signUpAPI = async (
    userData: Omit<SignUpFormData, 'confirmPassword' | 'agreeToTerms'>
  ): Promise<ApiResponse> => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Sign up failed');
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
  const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    setSubmitError('');
    setIsLoading(true);

    try {
      const { confirmPassword, agreeToTerms, ...userData } = data;
      const response = await signUpAPI(userData);

      if (response.success && response.data) {
        console.log('Sign Up Success:', response.data);

        // Store auth tokens in cookies (not localStorage)
        setCookie('token', response.data.token, 1); // 1 day for access token
        setCookie('refreshToken', response.data.refreshToken, 7); // 7 days for refresh token

        // Store user data in localStorage for client-side use
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Reset form on success
        reset();

        // Handle user registration success
        if (!response.data.user.isVerified) {
          // This shouldn't happen since we set isVerified to true, but just in case
          console.log('⚠️ User created but not verified (unexpected)');

          setTimeout(() => {
            router.push('/verify-email');
          }, 1000);

          alert(
            'Account created successfully! Please check your email for verification link.'
          );
        } else {
          // User is verified and ready to use the app
          console.log(
            '✅ Account created and ready, redirecting to dashboard...'
          );

          setTimeout(() => {
            router.push('/home');
            router.refresh(); // Force a refresh to trigger middleware
          }, 100);

          // Show success message
          alert('Account created successfully! Welcome to Instagram AI!');
        }
      } else {
        throw new Error(response.message || 'Sign up failed');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      let errorMessage = 'Failed to create account. Please try again.';

      if (error instanceof Error) {
        // Handle specific error messages from API
        if (error.message.includes('already exists')) {
          if (error.message.includes('email')) {
            errorMessage =
              'An account with this email already exists. Please try signing in.';
          } else if (error.message.includes('mobile')) {
            errorMessage = 'An account with this mobile number already exists.';
          } else {
            errorMessage = 'Account already exists. Please try signing in.';
          }
        } else if (error.message.includes('too common')) {
          errorMessage =
            'Password is too common. Please choose a stronger password.';
        } else if (
          error.message.includes('Rate limit') ||
          error.message.includes('Too many')
        ) {
          errorMessage =
            'Too many signup attempts. Please wait 15 minutes before trying again.';
        } else if (error.message.includes('Network error')) {
          errorMessage =
            'Network error. Please check your connection and try again.';
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

  // Handle mobile number formatting
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setValue('mobileNumber', value, {
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  // Check if passwords match
  const passwordsMatch = useMemo(() => {
    return confirmPasswordValue && passwordValue === confirmPasswordValue;
  }, [passwordValue, confirmPasswordValue]);

  // Handle navigation to signin
  const handleSignInClick = () => {
    router.push('/signin');
  };

  return (
    <div className='gradient flex min-h-screen items-center justify-center p-4'>
      <div className='w-full max-w-xl'>
        <div className='rounded-2xl border border-white/20 p-8 shadow-2xl backdrop-blur-md'>
          {/* Header */}
          <div className='mb-8 text-center'>
            <div className='mb-4 flex items-center justify-center space-x-2'>
              <Sparkles className='h-8 w-8 text-purple-400' />
              <span className='text-2xl font-bold text-white'>
                Instagram AI
              </span>
            </div>
            <h1 className='mb-2 text-3xl font-bold text-white'>
              Create Account
            </h1>
            <p className='text-white/70'>
              Join thousands of successful creators
            </p>
          </div>

          {/* Sign Up Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='space-y-6'
            noValidate
          >
            {/* Global Error Message */}
            {submitError && (
              <div
                className='rounded-lg border border-red-400 bg-red-500/20 p-4'
                role='alert'
              >
                <div className='flex items-center space-x-2 text-red-400'>
                  <AlertCircle className='h-5 w-5' />
                  <span className='text-sm'>{submitError}</span>
                </div>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label
                htmlFor='name'
                className='mb-2 block font-medium text-white'
              >
                Full Name <span className='text-red-400'>*</span>
              </label>
              <div className='relative'>
                <User className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-white/50' />
                <input
                  id='name'
                  type='text'
                  {...register('name', validationRules.name)}
                  className={`w-full rounded-lg border bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/50 transition-colors focus:outline-none focus:ring-2 ${
                    errors.name
                      ? 'border-red-400 focus:ring-red-400'
                      : watchedFields.name && !errors.name
                        ? 'border-green-400 focus:ring-green-400'
                        : 'border-white/20 focus:ring-purple-400'
                  }`}
                  placeholder='Enter your full name'
                  disabled={isLoading}
                  autoComplete='name'
                />
              </div>
              {errors.name && (
                <div
                  className='mt-2 flex items-center space-x-1 text-sm text-red-400'
                  role='alert'
                >
                  <AlertCircle className='h-4 w-4' />
                  <span>{errors.name.message}</span>
                </div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor='email'
                className='mb-2 block font-medium text-white'
              >
                Email Address <span className='text-red-400'>*</span>
              </label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-white/50' />
                <input
                  id='email'
                  type='email'
                  {...register('email', validationRules.email)}
                  className={`w-full rounded-lg border bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/50 transition-colors focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-400 focus:ring-red-400'
                      : watchedFields.email && !errors.email
                        ? 'border-green-400 focus:ring-green-400'
                        : 'border-white/20 focus:ring-purple-400'
                  }`}
                  placeholder='Enter your email address'
                  disabled={isLoading}
                  autoComplete='email'
                />
              </div>
              {errors.email && (
                <div
                  className='mt-2 flex items-center space-x-1 text-sm text-red-400'
                  role='alert'
                >
                  <AlertCircle className='h-4 w-4' />
                  <span>{errors.email.message}</span>
                </div>
              )}
            </div>

            {/* Mobile Number Field */}
            <div>
              <label
                htmlFor='mobileNumber'
                className='mb-2 block font-medium text-white'
              >
                Mobile Number <span className='text-red-400'>*</span>
              </label>
              <div className='relative'>
                <Phone className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-white/50' />
                <input
                  id='mobileNumber'
                  type='tel'
                  {...register('mobileNumber', validationRules.mobileNumber)}
                  onChange={handleMobileChange}
                  className={`w-full rounded-lg border bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/50 transition-colors focus:outline-none focus:ring-2 ${
                    errors.mobileNumber
                      ? 'border-red-400 focus:ring-red-400'
                      : watchedFields.mobileNumber && !errors.mobileNumber
                        ? 'border-green-400 focus:ring-green-400'
                        : 'border-white/20 focus:ring-purple-400'
                  }`}
                  placeholder='Enter your mobile number'
                  disabled={isLoading}
                  autoComplete='tel'
                  maxLength={10}
                />
              </div>
              {errors.mobileNumber && (
                <div
                  className='mt-2 flex items-center space-x-1 text-sm text-red-400'
                  role='alert'
                >
                  <AlertCircle className='h-4 w-4' />
                  <span>{errors.mobileNumber.message}</span>
                </div>
              )}
            </div>

            {/* Instagram URL Field */}
            <div>
              <label
                htmlFor='instagramUrl'
                className='mb-2 block font-medium text-white'
              >
                Instagram URL <span className='text-white/50'>(Optional)</span>
              </label>
              <div className='relative'>
                <svg
                  className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-white/50'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
                </svg>
                <input
                  id='instagramUrl'
                  type='url'
                  {...register('instagramUrl', validationRules.instagramUrl)}
                  className={`w-full rounded-lg border bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/50 transition-colors focus:outline-none focus:ring-2 ${
                    errors.instagramUrl
                      ? 'border-red-400 focus:ring-red-400'
                      : watchedFields.instagramUrl && !errors.instagramUrl
                        ? 'border-green-400 focus:ring-green-400'
                        : 'border-white/20 focus:ring-purple-400'
                  }`}
                  placeholder='https://instagram.com/username or @username'
                  disabled={isLoading}
                />
              </div>
              {errors.instagramUrl && (
                <div
                  className='mt-2 flex items-center space-x-1 text-sm text-red-400'
                  role='alert'
                >
                  <AlertCircle className='h-4 w-4' />
                  <span>{errors.instagramUrl.message}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor='password'
                className='mb-2 block font-medium text-white'
              >
                Password <span className='text-red-400'>*</span>
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-white/50' />
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', validationRules.password)}
                  className={`w-full rounded-lg border bg-white/5 py-3 pl-10 pr-12 text-white placeholder-white/50 transition-colors focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-red-400 focus:ring-red-400'
                      : watchedFields.password && !errors.password
                        ? 'border-green-400 focus:ring-green-400'
                        : 'border-white/20 focus:ring-purple-400'
                  }`}
                  placeholder='Create a strong password'
                  disabled={isLoading}
                  autoComplete='new-password'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 transform text-white/50 transition-colors hover:text-white'
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {passwordValue && (
                <div className='mt-2'>
                  <div className='mb-1 flex items-center justify-between'>
                    <span className='text-xs text-white/70'>
                      Password Strength
                    </span>
                    <span
                      className={`text-xs font-medium capitalize ${passwordStrength.textColor}`}
                    >
                      {passwordStrength.level}
                    </span>
                  </div>
                  <div className='h-1.5 w-full rounded-full bg-white/20'>
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{
                        width: `${(passwordStrength.score / 4) * 100}%`,
                      }}
                    ></div>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <div className='mt-2 space-y-1'>
                      {passwordStrength.feedback
                        .slice(0, 2)
                        .map((item, index) => (
                          <div
                            key={index}
                            className='flex items-center space-x-1 text-xs text-white/60'
                          >
                            <Info className='h-3 w-3' />
                            <span>{item}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {errors.password && (
                <div
                  className='mt-2 flex items-center space-x-1 text-sm text-red-400'
                  role='alert'
                >
                  <AlertCircle className='h-4 w-4' />
                  <span>{errors.password.message}</span>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor='confirmPassword'
                className='mb-2 block font-medium text-white'
              >
                Confirm Password <span className='text-red-400'>*</span>
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-white/50' />
                <input
                  id='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register(
                    'confirmPassword',
                    validationRules.confirmPassword
                  )}
                  className={`w-full rounded-lg border bg-white/5 py-3 pl-10 pr-12 text-white placeholder-white/50 transition-colors focus:outline-none focus:ring-2 ${
                    errors.confirmPassword
                      ? 'border-red-400 focus:ring-red-400'
                      : passwordsMatch
                        ? 'border-green-400 focus:ring-green-400'
                        : 'border-white/20 focus:ring-purple-400'
                  }`}
                  placeholder='Confirm your password'
                  disabled={isLoading}
                  autoComplete='new-password'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 transform text-white/50 transition-colors hover:text-white'
                  disabled={isLoading}
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirm password'
                      : 'Show confirm password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>

              {/* Password Match Indicator */}
              {confirmPasswordValue && (
                <div className='mt-2'>
                  {passwordsMatch ? (
                    <div className='flex items-center space-x-1 text-sm text-green-400'>
                      <CheckCircle className='h-4 w-4' />
                      <span>Passwords match</span>
                    </div>
                  ) : (
                    <div className='flex items-center space-x-1 text-sm text-red-400'>
                      <AlertCircle className='h-4 w-4' />
                      <span>Passwords do not match</span>
                    </div>
                  )}
                </div>
              )}

              {errors.confirmPassword && (
                <div
                  className='mt-2 flex items-center space-x-1 text-sm text-red-400'
                  role='alert'
                >
                  <AlertCircle className='h-4 w-4' />
                  <span>{errors.confirmPassword.message}</span>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div>
              <div className='flex items-start space-x-3'>
                <input
                  id='agreeToTerms'
                  type='checkbox'
                  {...register('agreeToTerms', validationRules.agreeToTerms)}
                  className={`mt-1 h-5 w-5 rounded border-2 text-purple-600 focus:ring-2 focus:ring-purple-400 ${
                    errors.agreeToTerms ? 'border-red-400' : 'border-white/30'
                  }`}
                  disabled={isLoading}
                />
                <label
                  htmlFor='agreeToTerms'
                  className='text-sm leading-relaxed text-white/70'
                >
                  I agree to the{' '}
                  <button
                    type='button'
                    className='text-purple-300 underline transition-colors hover:text-purple-200'
                    onClick={() => router.push('/terms-condition')}
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type='button'
                    className='text-purple-300 underline transition-colors hover:text-purple-200'
                    onClick={() => router.push('/privacy-policy')}
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
              {errors.agreeToTerms && (
                <div
                  className='mt-2 flex items-center space-x-1 text-sm text-red-400'
                  role='alert'
                >
                  <AlertCircle className='h-4 w-4' />
                  <span>{errors.agreeToTerms.message}</span>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className='flex space-x-3'>
              <button
                type='submit'
                disabled={isLoading || !isValid}
                className={`${isDirty ? 'flex-1' : 'w-full'} flex items-center justify-center space-x-2 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-purple-600/50`}
              >
                {isLoading ? (
                  <>
                    <div className='h-5 w-5 animate-spin rounded-full border-b-2 border-white'></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </div>

            {/* Form Validation Status */}
            {isDirty && (
              <div className='text-center'>
                <p
                  className={`text-xs ${isValid ? 'text-green-400' : 'text-yellow-400'}`}
                >
                  {isValid ? 'Form is valid ✓' : 'Please fix the errors above'}
                </p>
              </div>
            )}

            {/* Sign In Link */}
            <div className='pt-4 text-center'>
              <p className='text-white/70'>
                Already have an account?{' '}
                <button
                  type='button'
                  onClick={handleSignInClick}
                  className='font-semibold text-purple-300 transition-colors hover:text-purple-200'
                  disabled={isLoading}
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className='mt-8 text-center'>
          <p className='text-xs text-white/50'>
            By creating an account, you agree to our{' '}
            <button
              type='button'
              className='text-purple-300 transition-colors hover:text-purple-200'
              onClick={() => router.push('/terms-condition')}
            >
              Terms of Service
            </button>{' '}
            and{' '}
            <button
              type='button'
              className='text-purple-300 transition-colors hover:text-purple-200'
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

export default SignUpPage;
