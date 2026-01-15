import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// protection mapping
const protectedRoutes = {
  '/admin': ['admin'],
  '/teacher': ['teacher'],
  '/student': ['student'],
  '/subscription': ['student', 'teacher'],
};

// routes with authentication
const authRequiredRoutes = ['/admin', '/teacher', '/student', '/subscription'];

// routes with no authentication
const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/education', '/testimonials', '/api-docs', '/api', '/donate', '/teachers'];

// Enforce JWT_SECRET in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be set in production');
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // allow public and API routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith('/api/'))) {
    return NextResponse.next();
  }

  // check if route requires authentication
  const requiresAuth = authRequiredRoutes.some(route => pathname.startsWith(route));

  if (requiresAuth) {
    // get token from cookie or header
    const token = request.cookies.get('token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    // redirect to login if no token
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // verify token and check role
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userRole = payload.role as string;
      const subscriptionStatus = payload.subscription_status as string;

      // Special check for teacher subscription
      // If teacher is trying to access dashboard but subscription is not active
      if (userRole === 'teacher' &&
        pathname.startsWith('/teacher') &&
        subscriptionStatus !== 'active') {
        return NextResponse.redirect(new URL('/subscription/teacher', request.url));
      }

      // check role permissions for protected routes
      for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
        if (pathname.startsWith(route) && !allowedRoles.includes(userRole)) {
          // unauthorized - redirect to their appropriate dashboard
          const roleRedirectMap: Record<string, string> = {
            'admin': '/admin',
            'teacher': '/teacher',
            'student': '/student',
          };
          const redirectPath = roleRedirectMap[userRole] || '/login';
          return NextResponse.redirect(new URL(redirectPath, request.url));
        }
      }

      // pass through with valid token and role
      const response = NextResponse.next();
      response.headers.set('x-user-role', userRole);
      return response;
    } catch (error) {
      console.error('Token verification failed:', error);
      const loginUrl = new URL('/login', request.url); //Invalid token, redirect to login
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
