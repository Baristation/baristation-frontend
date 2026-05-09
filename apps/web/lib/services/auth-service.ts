/**
 * Auth Service — 백엔드 인증 API 통신 서비스
 *
 * [Edge Runtime 호환]
 * - 순수 fetch API만 사용
 * - Node.js 전용 모듈(fs, http, crypto 등) 사용 금지
 *
 * [사용처]
 * - middleware.ts (Edge Runtime)
 * - app/api/auth/refresh/route.ts (Node.js Runtime)
 */

import { BffInfo, getBffHeaders } from '@/lib/utils/bff-utils';

export interface RefreshResult {
  accessToken: string;
  /** 백엔드가 발급한 모든 Set-Cookie 헤더 목록 */
  setCookies: string[];
  message: string;
}

/**
 * 백엔드 /api/auth/refresh 응답 Body 구조
 */
interface BackendRefreshResponse {
  status: string;
  message: string;
  data: {
    accessToken: string;
  } | null;
}

export const authService = {
  /**
   * refreshToken을 사용하여 새로운 accessToken을 발급받습니다.
   *
   * @param cookie - 브라우저에서 전달된 Cookie 헤더 (refreshToken 포함)
   * @param bffInfo - BFF 설정 정보
   * @throws Error - 네트워크 오류, 백엔드 오류 등
   */
  async refreshAccessToken(cookie: string, bffInfo: BffInfo): Promise<RefreshResult> {
    const refreshUrl = `${bffInfo.backendUrl}/api/auth/refresh`;

    const requestHeaders = getBffHeaders(bffInfo, {
      Cookie: cookie,
      accept: 'application/json',
    });

    let response: Response;
    try {
      response = await fetch(refreshUrl, {
        method: 'POST',
        headers: requestHeaders,
        signal: AbortSignal.timeout(5000),
      });
    } catch (networkError) {
      throw new Error(`[AuthService] 네트워크 오류: ${String(networkError)}`);
    }

    if (!response.ok) {
      let errorDetail = '';
      try {
        errorDetail = await response.text();
      } catch {
        errorDetail = '(응답 body 없음)';
      }
      console.error('[AuthService] 토큰 재발급 실패', {
        status: response.status,
        statusText: response.statusText,
        body: errorDetail,
        url: refreshUrl,
      });
      throw new Error(`[AuthService] 토큰 재발급 실패: HTTP ${response.status}. ${errorDetail}`);
    }

    let body: BackendRefreshResponse;
    try {
      body = await response.json();
    } catch {
      throw new Error('[AuthService] 응답 JSON 파싱 실패');
    }

    if (!body.data?.accessToken) {
      throw new Error(
        `[AuthService] 백엔드 토큰 재발급 오류: ${body.message ?? '알 수 없는 오류'}`,
      );
    }

    // 백엔드에서 내려온 모든 쿠키(토큰 회전 포함)를 캡처
    const setCookies = response.headers.getSetCookie();

    return {
      accessToken: body.data.accessToken,
      setCookies,
      message: body.message,
    };
  },
};
