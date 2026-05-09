import { NextRequest, NextResponse } from 'next/server';

import { authService } from '@/lib/services/auth-service';
import { AUTH_TOKEN_KEY, REDIRECT_COOKIE_KEY, isValidInternalPath } from '@/lib/utils/auth-utils';
import {
  getBffInfo,
  getBffHeaders,
  proxyCookies,
  rewriteCookieForLocal,
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
 * Middleware — 인증 전역 처리
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const bffInfo = getBffInfo(request);

  // ─────────────────────────────────────────────────────────────
  // 0. OAuth 프록시 (/login/oauth2/code/*, /oauth2/*)
  // ─────────────────────────────────────────────────────────────
  if (pathname.startsWith('/login/oauth2/code/') || pathname.startsWith('/oauth2/')) {
    const targetUrl = `${bffInfo.backendUrl}${pathname}${request.nextUrl.search}`;
    const requestHeaders = getBffHeaders(bffInfo, request.headers);

    try {
      const backendResponse = await fetch(targetUrl, {
        method: 'GET',
        headers: requestHeaders,
        redirect: 'manual',
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });

      const res = NextResponse.redirect(new URL('/auth/success', request.url));

      // 백엔드 쿠키들을 브라우저로 전달 (로컬 대응 포함)
      proxyCookies(backendResponse, res, bffInfo.isLocal);

      return res;
    } catch (error) {
      console.error('[Middleware] OAuth Proxy Error:', error);
      return NextResponse.redirect(new URL('/login?error=proxy_failed', request.url));
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 1. /auth/success 환승역
  // ─────────────────────────────────────────────────────────────
  if (pathname === '/auth/success') {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      const response = NextResponse.redirect(
        new URL('/login?error=missing_refresh_token', request.url),
      );
      response.cookies.delete(AUTH_TOKEN_KEY);
      response.cookies.delete(REDIRECT_COOKIE_KEY);
      return response;
    }

    try {
      // 직접 서비스를 호출하여 토큰 교환
      const result = await authService.refreshAccessToken(
        request.headers.get('cookie') ?? '',
        bffInfo,
      );
      const accessToken = result.accessToken;

      if (!accessToken) {
        throw new Error('No access token received from backend');
      }

      // 최종 목적지 결정
      const rawRedirect = request.cookies.get(REDIRECT_COOKIE_KEY)?.value;
      let redirectTo = '/';
      if (rawRedirect) {
        const decoded = decodeURIComponent(rawRedirect);
        if (isValidInternalPath(decoded)) {
          redirectTo = decoded;
        }
      }

      const res = NextResponse.redirect(new URL(redirectTo, request.url));

      // accessToken 설정
      res.cookies.set(AUTH_TOKEN_KEY, accessToken, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
        secure: !bffInfo.isLocal,
      });

      // 백엔드가 준 모든 쿠키(refreshToken 포함)를 업데이트
      result.setCookies.forEach((cookie) => {
        res.headers.append('set-cookie', rewriteCookieForLocal(cookie, bffInfo.isLocal));
      });

      res.cookies.delete(REDIRECT_COOKIE_KEY);
      return res;
    } catch (error) {
      console.error('[Middleware] /auth/success 처리 오류:', error);
      const errorMsg = error instanceof Error ? encodeURIComponent(error.message) : 'unknown';
      const res = NextResponse.redirect(
        new URL(`/login?error=exchange_failed&details=${errorMsg}`, request.url),
      );
      res.cookies.delete(AUTH_TOKEN_KEY);
      res.cookies.delete(REDIRECT_COOKIE_KEY);
      return res;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. Protected 경로 보호
  // ─────────────────────────────────────────────────────────────
  if (isProtectedPath(pathname)) {
    const accessToken = request.cookies.get(AUTH_TOKEN_KEY)?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (accessToken) {
      return NextResponse.next();
    }

    if (refreshToken) {
      try {
        const result = await authService.refreshAccessToken(
          request.headers.get('cookie') ?? '',
          bffInfo,
        );

        if (!result.accessToken) {
          throw new Error('No access token received');
        }

        const res = NextResponse.next();

        res.cookies.set(AUTH_TOKEN_KEY, result.accessToken, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
          sameSite: 'lax',
          secure: !bffInfo.isLocal,
        });

        // 백엔드가 준 모든 쿠키를 업데이트
        result.setCookies.forEach((cookie) => {
          res.headers.append('set-cookie', rewriteCookieForLocal(cookie, bffInfo.isLocal));
        });

        return res;
      } catch (error) {
        console.warn('[Middleware] Protected 경로 토큰 재발급 실패:', error);
      }
    }

    const res = NextResponse.redirect(new URL('/login', request.url));
    const encodedPath = encodeURIComponent(pathname + (request.nextUrl.search ?? ''));
    res.cookies.set(REDIRECT_COOKIE_KEY, encodedPath, {
      path: '/',
      maxAge: 60 * 60,
      sameSite: 'lax',
    });

    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/success', '/login/oauth2/:path*', '/oauth2/:path*', '/my', '/my/:path*'],
};
