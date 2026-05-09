import { NextRequest, NextResponse } from 'next/server';

import { authService } from '@/lib/services/auth-service';
import { AUTH_TOKEN_KEY, REDIRECT_COOKIE_KEY, isValidInternalPath } from '@/lib/utils/auth-utils';
import {
  getBffInfo,
  getBffHeaders,
  proxyCookies,
  rewriteCookieForLocal,
  BffInfo,
} from '@/lib/utils/bff-utils';

/**
 * Protected 경로 목록
 */
const PROTECTED_PATHS: string[] = ['/my'];

/**
 * 주어진 경로가 protected 경로인지 확인
 */
function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/**
 * 0. OAuth 프록시 핸들러 (/login/oauth2/code/*, /oauth2/*)
 */
async function handleOAuthProxy(request: NextRequest, bffInfo: BffInfo) {
  const { pathname, search } = request.nextUrl;
  const targetUrl = `${bffInfo.backendUrl}${pathname}${search}`;
  const requestHeaders = getBffHeaders(bffInfo, request.headers);

  try {
    const backendResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: requestHeaders,
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });

    // 백엔드의 리다이렉션 경로 요구사항에 따라 /auth/success로 이동
    const res = NextResponse.redirect(new URL('/auth/success', request.url));
    proxyCookies(backendResponse, res, bffInfo.isLocal);
    return res;
  } catch (error) {
    console.error('[Middleware] OAuth Proxy Error:', error);
    return NextResponse.redirect(new URL('/login?error=proxy_failed', request.url));
  }
}

/**
 * 1. /auth/success 환승역 핸들러
 */
async function handleAuthSuccess(request: NextRequest, bffInfo: BffInfo) {
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    const res = NextResponse.redirect(new URL('/login?error=missing_refresh_token', request.url));
    res.cookies.delete(AUTH_TOKEN_KEY);
    res.cookies.delete(REDIRECT_COOKIE_KEY);
    return res;
  }

  try {
    const result = await authService.refreshAccessToken(
      request.headers.get('cookie') ?? '',
      bffInfo,
    );

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
      secure: !bffInfo.isLocal,
    });

    result.setCookies.forEach((cookie) => {
      res.headers.append('set-cookie', rewriteCookieForLocal(cookie, bffInfo.isLocal));
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
async function handleProtectedRoute(request: NextRequest, bffInfo: BffInfo) {
  const { pathname, search } = request.nextUrl;
  const accessToken = request.cookies.get(AUTH_TOKEN_KEY)?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (accessToken) return NextResponse.next();

  if (refreshToken) {
    try {
      const result = await authService.refreshAccessToken(
        request.headers.get('cookie') ?? '',
        bffInfo,
      );

      const res = NextResponse.next();
      res.cookies.set(AUTH_TOKEN_KEY, result.accessToken, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
        secure: !bffInfo.isLocal,
      });

      result.setCookies.forEach((cookie) => {
        res.headers.append('set-cookie', rewriteCookieForLocal(cookie, bffInfo.isLocal));
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
 * Middleware — 인증 전역 처리 메인
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const bffInfo = getBffInfo(request);

  // 0. OAuth 프록시
  if (pathname.startsWith('/login/oauth2/code/') || pathname.startsWith('/oauth2/')) {
    return handleOAuthProxy(request, bffInfo);
  }

  // 1. /auth/success 환승역
  if (pathname === '/auth/success') {
    return handleAuthSuccess(request, bffInfo);
  }

  // 2. Protected 경로 보호
  if (isProtectedPath(pathname)) {
    return handleProtectedRoute(request, bffInfo);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/success', '/login/oauth2/:path*', '/oauth2/:path*', '/my', '/my/:path*'],
};
