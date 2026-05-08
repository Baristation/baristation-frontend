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

export interface RefreshResult {
  accessToken: string;
  /** 백엔드가 새로운 refreshToken을 응답 헤더로 돌려주는 경우 */
  refreshToken?: string;
  message: string;
}

/**
 * 백엔드 /api/auth/refresh 응답 Body 구조
 * {
 *   "status": "SUCCESS",
 *   "message": "토큰 재발급 성공",
 *   "data": { "accessToken": "..." }
 * }
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
   * [백엔드 명세]
   * - Method: POST
   * - Endpoint: /api/auth/refresh
   * - Request Cookie: refreshToken={jwtRefreshToken}
   * - Response Body: { status, message, data: { accessToken } }
   * - Response Header: refreshToken={newJwtRefreshToken}
   *
   * @param refreshToken - 현재 보유한 Refresh JWT
   * @throws Error - 네트워크 오류, 백엔드 오류, 토큰 없음 등
   */
  async refreshAccessToken(refreshToken: string): Promise<RefreshResult> {
    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      throw new Error('[AuthService] BACKEND_URL 환경변수가 설정되지 않았습니다.');
    }

    const reissueUrl = `${backendUrl}/api/auth/refresh`;

    // [중요] 백엔드는 Request Body 없이 Cookie만으로 RT를 받습니다.
    // Content-Type을 설정하면 백엔드가 body를 기대하게 되어 오류 발생 가능성이 있으므로 제거합니다.
    const requestHeaders: Record<string, string> = {
      Cookie: `refreshToken=${refreshToken}`,
    };

    if (process.env.BFF_SECRET) {
      requestHeaders['X-BFF-Secret'] = process.env.BFF_SECRET;
    }

    let response: Response;
    try {
      response = await fetch(reissueUrl, {
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
        url: reissueUrl,
      });
      throw new Error(`[AuthService] 토큰 재발급 실패: HTTP ${response.status}. ${errorDetail}`);
    }

    let body: BackendRefreshResponse;
    try {
      body = await response.json();
    } catch {
      throw new Error('[AuthService] 응답 JSON 파싱 실패');
    }

    if (body.status !== 'SUCCESS' || !body.data?.accessToken) {
      throw new Error(
        `[AuthService] 백엔드 토큰 재발급 오류: ${body.message ?? '알 수 없는 오류'}`,
      );
    }

    // HTTP 헤더 이름은 대소문자 구분 없음 — 소문자로 조회합니다.
    const newRefreshToken = response.headers.get('refreshtoken') ?? undefined;

    return {
      accessToken: body.data.accessToken,
      refreshToken: newRefreshToken,
      message: body.message,
    };
  },
};
