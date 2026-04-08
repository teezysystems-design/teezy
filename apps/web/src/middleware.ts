import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard'];
const LOGIN_PATH = '/dashboard/login';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login page through
  if (pathname === LOGIN_PATH) return NextResponse.next();

  const isDashboard = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isDashboard) return NextResponse.next();

  // Check for Supabase session cookie (set by the client-side auth helper)
  const token =
    request.cookies.get('sb-access-token')?.value ??
    request.cookies.get('supabase-auth-token')?.value;

  // Also accept the custom header set by apiFetch (from localStorage) — not present
  // in edge middleware, so we rely on cookies. If no token, redirect to login.
  if (!token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_PATH;
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
