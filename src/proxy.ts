import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const defaultPublicApiAllowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3002',
  'http://127.0.0.1:3002',
  'http://localhost:3003',
  'http://127.0.0.1:3003',
];

const configuredPublicApiAllowedOrigins = (process.env.ADMIN_PUBLIC_API_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const publicApiAllowedOrigins =
  configuredPublicApiAllowedOrigins.length > 0
    ? configuredPublicApiAllowedOrigins
    : defaultPublicApiAllowedOrigins;

const protectedRoutes = [
  '/dashboard',
  '/projects',
  '/blogs',
  '/publications',
  '/links',
  '/guestbook',
  '/messages',
  '/analytics',
  '/logs',
  '/notifications',
  '/settings',
];

function applyPublicApiCors(response: NextResponse, origin: string) {
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Vary', 'Origin');
  return response;
}

export async function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const sessionCookie =
    req.cookies.get('authjs.session-token') || req.cookies.get('__Secure-authjs.session-token');
  const isLoggedIn = !!sessionCookie;

  const isProtectedRoute = protectedRoutes.some((route) => nextUrl.pathname.startsWith(route));
  const isApiAdminRoute = nextUrl.pathname.startsWith('/api/v1/admin');
  const isApiPublicRoute = nextUrl.pathname.startsWith('/api/v1/public');

  if (isApiPublicRoute) {
    const origin = req.headers.get('origin');

    if (origin && !publicApiAllowedOrigins.includes(origin)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (req.method === 'OPTIONS') {
      return origin
        ? applyPublicApiCors(new NextResponse(null, { status: 204 }), origin)
        : new NextResponse(null, { status: 204 });
    }

    const response = NextResponse.next();
    return origin ? applyPublicApiCors(response, origin) : response;
  }

  if (isProtectedRoute || isApiAdminRoute) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
      return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*[.](?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
