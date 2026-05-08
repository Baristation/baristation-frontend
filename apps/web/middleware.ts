import { NextRequest, NextResponse } from 'next/server';

import { authService } from '@/lib/services/auth-service';
import { AUTH_TOKEN_KEY, REDIRECT_COOKIE_KEY, isValidInternalPath } from '@/lib/utils/auth-utils';

/**
 * Protected 경로 목록
 * - 이 경로들은 인증된 유저만 접근 가능
 * - 미인증 유저는 /login 으로 리다이렉트
 */
const PROTECTED_PATHS: string[] = [
  // 테스트용 인증 확인 페이지
  '/my',
  // 추후 인증이 필요한 경로를 여기에 추가
  // 예: '/notes', '/profile'
];

/**
 * 주어진 경로가 protected 경로인지 확인
 */
function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/**
 * Middleware — 인증 전역 처리
 *
 * [처리 순서]
 * 1. /auth/success 환승역: refreshToken → accessToken 교환 후 목적지로 리다이렉트
 * 2. Protected 경로: accessToken 검증 → 없으면 refreshToken으로 재발급 → 없으면 /login으로 리다이렉트
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─────────────────────────────────────────────────────────────
  // 0. OAuth 프록시 및 보안 헤더 주입 (/login/oauth2/code/*, /oauth2/*)
  // ─────────────────────────────────────────────────────────────
  // next.config.ts의 rewrites는 헤더 주입이 불가능하므로 미들웨어에서 처리합니다.
  if (pathname.startsWith('/login/oauth2/code/') || pathname.startsWith('/oauth2/')) {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) return NextResponse.next();

    const targetUrl = new URL(pathname + request.nextUrl.search, backendUrl);
    const requestHeaders = new Headers(request.headers);
    const isSecure = request.nextUrl.protocol === 'https:';

    // 보안 및 식별 헤더 주입
    if (process.env.BFF_SECRET) {
      requestHeaders.set('X-BFF-Secret', process.env.BFF_SECRET);
    }
    requestHeaders.set('X-BFF-Host', request.nextUrl.host);
    requestHeaders.set('X-BFF-Proto', request.nextUrl.protocol.replace(':', ''));
    requestHeaders.set('X-BFF-Port', request.nextUrl.port || (isSecure ? '443' : '80'));

    // 호환성을 위한 X-Forwarded 헤더
    requestHeaders.set('X-Forwarded-Host', request.nextUrl.host);
    requestHeaders.set('X-Forwarded-Proto', request.nextUrl.protocol.replace(':', ''));

    return NextResponse.rewrite(targetUrl, {
      request: {
        headers: requestHeaders,
      },
    });
  }
  if (pathname === '/auth/success') {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // refreshToken이 없으면 로그인 페이지로 리다이렉트
    if (!refreshToken) {
      const response = NextResponse.redirect(
        new URL('/login?error=missing_refresh_token', request.url),
      );
      response.cookies.delete(AUTH_TOKEN_KEY);
      response.cookies.delete(REDIRECT_COOKIE_KEY);
      return response;
    }

    try {
      // BFF API 대신 직접 서비스를 호출하여 성능 최적화 (Internal Fetch 제거)
      const result = await authService.refreshAccessToken(refreshToken);
      const accessToken = result.accessToken;

      if (!accessToken) {
        throw new Error('No access token received from backend');
      }

      // 최종 목적지 결정 및 검증 (오픈 리다이렉트 방지)
      const rawRedirect = request.cookies.get(REDIRECT_COOKIE_KEY)?.value;
      let redirectTo = '/';
      if (rawRedirect) {
        const decoded = decodeURIComponent(rawRedirect);
        if (isValidInternalPath(decoded)) {
          redirectTo = decoded;
        } else {
          console.warn(`[Middleware] Invalid redirect detected: ${decoded}. Falling back to /`);
        }
      }

      const res = NextResponse.redirect(new URL(redirectTo, request.url));
      const isSecure = request.nextUrl.protocol === 'https:';

      // accessToken을 쿠키에 설정 (일반 쿠키 — JS에서 읽기 가능, 미들웨어 검증용)
      res.cookies.set(AUTH_TOKEN_KEY, accessToken, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7일
        sameSite: 'lax',
        secure: isSecure,
      });

      // 새로운 refreshToken이 발급된 경우 쿠키 업데이트
      if (result.refreshToken) {
        res.cookies.set('refreshToken', result.refreshToken, {
          path: '/',
          httpOnly: true,
          secure: isSecure,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30일
        });
      }

      // 임시 쿠키 정리
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

    // 2-1. accessToken이 있으면 통과
    if (accessToken) {
      return NextResponse.next();
    }

    // 2-2. accessToken이 없고 refreshToken이 있으면 재발급 시도
    if (refreshToken) {
      try {
        const result = await authService.refreshAccessToken(refreshToken);

        if (!result.accessToken) {
          throw new Error('No access token received');
        }

        const res = NextResponse.next();
        const isSecure = request.nextUrl.protocol === 'https:';

        res.cookies.set(AUTH_TOKEN_KEY, result.accessToken, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
          sameSite: 'lax',
          secure: isSecure,
        });

        if (result.refreshToken) {
          res.cookies.set('refreshToken', result.refreshToken, {
            path: '/',
            httpOnly: true,
            secure: isSecure,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
          });
        }

        return res;
      } catch (error) {
        console.warn('[Middleware] Protected 경로 토큰 재발급 실패:', error);
        // 재발급 실패 — 로그인 페이지로 리다이렉트
      }
    }

    // 2-3. 인증 정보 없음 — 현재 경로를 redirect 쿠키에 저장 후 로그인으로
    const res = NextResponse.redirect(new URL('/login', request.url));
    const encodedPath = encodeURIComponent(pathname + (request.nextUrl.search ?? ''));
    res.cookies.set(REDIRECT_COOKIE_KEY, encodedPath, {
      path: '/',
      maxAge: 60 * 60, // 1시간
      sameSite: 'lax',
    });

    return res;
  }

  return NextResponse.next();
}

/**
 * 미들웨어가 실행될 경로 설정
 *
 * [주의] Next.js App Router의 라우트 그룹 (main), (auth) 은
 * 실제 URL 경로에 포함되지 않습니다.
 */
export const config = {
  matcher: [
    // 환승역 및 OAuth 콜백 프록시
    '/auth/success',
    '/login/oauth2/:path*',
    '/oauth2/:path*',
    // Protected 경로
    '/my',
    '/my/:path*',
    // '/notes/:path*',
  ],
};
