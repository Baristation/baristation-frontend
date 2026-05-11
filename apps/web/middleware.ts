import { NextRequest, NextResponse } from 'next/server';

import { fetchBackend, refreshTokens } from '@/lib/api/backend';
import {
  AUTH_TOKEN_KEY,
  REDIRECT_COOKIE_KEY,
  isValidInternalPath,
  proxyCookies,
  rewriteCookieForLocal,
} from '@/lib/utils/auth';

/**
 * Protected 경로 목록
 */
const PROTECTED_PATHS: string[] = ['/my'];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/**
 * 요청이 로컬 개발 환경인지 확인합니다.
 */
function isLocalRequest(request: NextRequest): boolean {
  const { hostname, protocol } = request.nextUrl;
  return hostname === 'localhost' || hostname === '127.0.0.1' || protocol === 'http:';
}

/**
 * 0. OAuth 프록시 핸들러 (/login/oauth2/code/*, /oauth2/*)
 */
async function handleOAuthProxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLocal = isLocalRequest(request);

  try {
    const backendResponse = await fetchBackend(`${pathname}${search}`, {
      method: 'GET',
      bffRequest: request,
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });

    // 백엔드의 리다이렉션 경로 요구사항에 따라 /auth/success로 이동
    const res = NextResponse.redirect(new URL('/auth/success', request.url));
    proxyCookies(backendResponse, res, isLocal);
    return res;
  } catch (error) {
    console.error('[Middleware] OAuth Proxy Error:', error);
    return NextResponse.redirect(new URL('/login?error=proxy_failed', request.url));
  }
}

/**
 * 1. /auth/success 환승역 핸들러
 */
async function handleAuthSuccess(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const isLocal = isLocalRequest(request);

  if (!refreshToken) {
    const res = NextResponse.redirect(new URL('/login?error=missing_refresh_token', request.url));
    res.cookies.delete(AUTH_TOKEN_KEY);
    res.cookies.delete(REDIRECT_COOKIE_KEY);
    return res;
  }

  try {
    const result = await refreshTokens(request);

    // 최종 목적지 결정
    const rawRedirect = request.cookies.get(REDIRECT_COOKIE_KEY)?.value;
    let redirectTo = '/';
    if (rawRedirect) {
      const decoded = decodeURIComponent(rawRedirect);
      if (isValidInternalPath(decoded)) redirectTo = decoded;
    }

    const res = NextResponse.redirect(new URL(redirectTo, request.url));

    // 신규 토큰 및 백엔드 쿠키 설정
    res.cookies.set(AUTH_TOKEN_KEY, result.accessToken, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: !isLocal,
    });

    result.setCookies.forEach((cookie) => {
      res.headers.append('set-cookie', rewriteCookieForLocal(cookie, isLocal));
    });

    res.cookies.delete(REDIRECT_COOKIE_KEY);
    return res;
  } catch (error) {
    console.error('[Middleware] Auth Success 처리 오류:', error);
    const errorMsg = error instanceof Error ? encodeURIComponent(error.message) : 'unknown';
    const res = NextResponse.redirect(
      new URL(`/login?error=exchange_failed&details=${errorMsg}`, request.url),
    );
    res.cookies.delete(AUTH_TOKEN_KEY);
    res.cookies.delete(REDIRECT_COOKIE_KEY);
    return res;
  }
}

/**
 * 2. Protected 경로 보호 핸들러
 */
async function handleProtectedRoute(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const accessToken = request.cookies.get(AUTH_TOKEN_KEY)?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const isLocal = isLocalRequest(request);

  if (accessToken) return NextResponse.next();

  if (refreshToken) {
    try {
      const result = await refreshTokens(request);

      const res = NextResponse.next();
      res.cookies.set(AUTH_TOKEN_KEY, result.accessToken, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
        secure: !isLocal,
      });

      result.setCookies.forEach((cookie) => {
        res.headers.append('set-cookie', rewriteCookieForLocal(cookie, isLocal));
      });

      return res;
    } catch (error) {
      console.warn('[Middleware] 자동 토큰 재발급 실패:', error);
    }
  }

  // 로그인 페이지로 리다이렉트 (목적지 저장)
  const res = NextResponse.redirect(new URL('/login', request.url));
  const encodedPath = encodeURIComponent(pathname + (search ?? ''));
  res.cookies.set(REDIRECT_COOKIE_KEY, encodedPath, {
    path: '/',
    maxAge: 60 * 60,
    sameSite: 'lax',
  });
  return res;
}

/**
 * 3. 로그인 페이지 접근 차단 핸들러
 * 이미 인증된 사용자가 /login에 접근하면 홈으로 리다이렉트합니다.
 */
function handleLoginPage(request: NextRequest): NextResponse | null {
  const accessToken = request.cookies.get(AUTH_TOKEN_KEY)?.value;
  if (accessToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return null;
}

/**
 * Middleware — 인증 전역 처리 메인
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0. OAuth 프록시
  if (pathname.startsWith('/login/oauth2/code/') || pathname.startsWith('/oauth2/')) {
    return handleOAuthProxy(request);
  }

  // 1. /auth/success 환승역
  if (pathname === '/auth/success') {
    return handleAuthSuccess(request);
  }

  // 2. Protected 경로 보호
  if (isProtectedPath(pathname)) {
    return handleProtectedRoute(request);
  }

  // 3. 로그인 페이지 — 인증된 사용자 차단
  if (pathname === '/login') {
    const redirect = handleLoginPage(request);
    if (redirect) return redirect;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/auth/success',
    '/login',
    '/login/oauth2/:path*',
    '/oauth2/:path*',
    '/my',
    '/my/:path*',
  ],
};
