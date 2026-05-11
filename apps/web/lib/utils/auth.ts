/**
 * 인증 관련 상수 및 유틸리티
 *
 * [Edge Runtime 호환]
 * - 미들웨어, 클라이언트 컴포넌트, Server Action 모두에서 사용 가능
 * - Node.js 전용 모듈 사용 금지
 */

// ─────────────────────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────────────────────

/** 브라우저 쿠키에 저장되는 Access Token 키 */
export const AUTH_TOKEN_KEY = 'baristation-auth-token';

/** OAuth 로그인 후 복귀할 경로를 임시 저장하는 쿠키 키 */
export const REDIRECT_COOKIE_KEY = 'baristation-redirect-to';

// ─────────────────────────────────────────────────────────────
// 경로 검증
// ─────────────────────────────────────────────────────────────

/**
 * 오픈 리다이렉트 공격 방지를 위한 내부 경로 검증
 * - 외부 도메인(http://, https://, //) 시작 경로 거부
 * - '/'로 시작하는 절대 경로만 허용
 */
export function isValidInternalPath(path: string): boolean {
  if (!path || typeof path !== 'string') return false;
  if (/^https?:\/\//i.test(path)) return false;
  if (path.startsWith('//')) return false;
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/i.test(path)) return false;
  return path.startsWith('/');
}

// ─────────────────────────────────────────────────────────────
// 클라이언트 사이드 인증 유틸
// ─────────────────────────────────────────────────────────────

/**
 * 클라이언트 사이드에서 쿠키 기반 인증 상태를 확인하는 유틸
 * SSR 환경(window 없음)에서도 안전하게 동작
 */
export const authUtils = {
  /** 쿠키에서 Access Token을 읽어 반환 */
  getToken(): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.split('; ').find((row) => row.startsWith(`${AUTH_TOKEN_KEY}=`));
    return match ? decodeURIComponent(match.split('=')[1]) : null;
  },

  /** Access Token 쿠키 삭제 */
  removeToken(): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  },

  /** 현재 인증 상태 확인 (토큰 존재 여부) */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

// ─────────────────────────────────────────────────────────────
// 쿠키 프록시 유틸 (구 bff-utils.ts)
// ─────────────────────────────────────────────────────────────

/**
 * 로컬 개발 환경(HTTP)에서 브라우저가 쿠키를 거부하지 않도록 수정합니다.
 */
export function rewriteCookieForLocal(cookie: string, isLocal: boolean): string {
  if (!isLocal) return cookie;

  return cookie
    .replace(/;\s*Secure\b/gi, '')
    .replace(/;\s*SameSite=None/gi, '; SameSite=Lax')
    .replace(/;\s*Domain=[^;]+/gi, '');
}

/**
 * 백엔드 응답에서 프론트엔드로 전달할 가공된 쿠키 목록을 가져옵니다.
 */
export function getProxyCookies(backendResponse: Response, isLocal: boolean): string[] {
  const cookies = backendResponse.headers.getSetCookie();
  return cookies.map((cookie) => rewriteCookieForLocal(cookie, isLocal));
}

/**
 * 백엔드 응답의 모든 Set-Cookie 헤더를 프론트엔드 응답으로 복사합니다.
 */
export function proxyCookies(
  backendResponse: Response,
  nextResponse: Response,
  isLocal: boolean,
): void {
  getProxyCookies(backendResponse, isLocal).forEach((cookie) => {
    nextResponse.headers.append('set-cookie', cookie);
  });
}
