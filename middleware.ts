// middleware.ts (in root directory)
import { jwtDecode } from 'jwt-decode';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

interface JWTPayload {
  userId: string;
  type: 'access';
  exp: number;
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/signin',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/faq',
  '/privacy-policy',
  '/terms-condition',
];

// Protected routes that require authentication
const PROTECTED_ROUTES = ['/home'];

// API routes that require authentication
const PROTECTED_API_ROUTES = ['/api/user', '/api/profile', '/api/protected'];

// API routes that don't require authentication
const PUBLIC_API_ROUTES = [
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/public',
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  });
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route));
}

function isProtectedApiRoute(pathname: string): boolean {
  return PROTECTED_API_ROUTES.some((route) => pathname.startsWith(route));
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  console.log(`🔍 Middleware: ${pathname}, Token: ${!!token}`);

  // Handle API routes
  if (isApiRoute(pathname)) {
    return handleApiRoutes(request, pathname, token);
  }

  // Handle frontend routes
  return handleFrontendRoutes(request, pathname, token);
}

async function handleApiRoutes(
  request: NextRequest,
  pathname: string,
  token?: string
): Promise<NextResponse> {
  // Allow public API routes
  if (isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }

  // Check if it's a protected API route
  if (isProtectedApiRoute(pathname)) {
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token);

      // Check token expiration
      if (decoded.exp * 1000 < Date.now()) {
        return NextResponse.json(
          { success: false, message: 'Token expired' },
          { status: 401 }
        );
      }

      // Check token type
      if (decoded.type !== 'access') {
        return NextResponse.json(
          { success: false, message: 'Invalid token type' },
          { status: 401 }
        );
      }

      // Add user info to headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.userId);
      requestHeaders.set('authorization', `Bearer ${token}`);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('Token validation error:', error);
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
  }

  // For any other API routes, allow them through
  return NextResponse.next();
}

async function handleFrontendRoutes(
  request: NextRequest,
  pathname: string,
  token?: string
): Promise<NextResponse> {
  const { origin } = request.nextUrl;

  // If user has token and tries to access auth pages, redirect to dashboard
  if (token && (pathname === '/signin' || pathname === '/signup')) {
    try {
      const decoded = jwtDecode<JWTPayload>(token);

      if (decoded.exp * 1000 > Date.now() && decoded.type === 'access') {
        console.log('✅ Authenticated user redirected to dashboard');
        return NextResponse.redirect(new URL('/home', origin));
      }
    } catch (error) {
      // Invalid token, clear it and allow access to auth pages
      console.log('🔄 Invalid token, clearing and allowing auth access');
      const response = NextResponse.next();
      response.cookies.delete('token');
      response.cookies.delete('refreshToken');
      return response;
    }
  }

  // Allow access to public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check if trying to access protected route
  if (isProtectedRoute(pathname)) {
    if (!token) {
      console.log('🚫 No token, redirecting to signin');
      return NextResponse.redirect(new URL('/signin', origin));
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token);

      // Check token expiration
      if (decoded.exp * 1000 < Date.now()) {
        console.log('⏰ Token expired, redirecting to signin');
        const response = NextResponse.redirect(new URL('/signin', origin));
        response.cookies.delete('token');
        response.cookies.delete('refreshToken');
        return response;
      }

      // Check token type
      if (decoded.type !== 'access') {
        console.log('🚫 Invalid token type, redirecting to signin');
        const response = NextResponse.redirect(new URL('/signin', origin));
        response.cookies.delete('token');
        response.cookies.delete('refreshToken');
        return response;
      }

      console.log('✅ Valid token, accessing protected route');
      return NextResponse.next();
    } catch (error) {
      console.error('Token validation error:', error);
      const response = NextResponse.redirect(new URL('/signin', origin));
      response.cookies.delete('token');
      response.cookies.delete('refreshToken');
      return response;
    }
  }

  // For any other routes, allow them through
  return NextResponse.next();
}

// Next.js 15 configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
