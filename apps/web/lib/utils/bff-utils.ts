import { NextRequest, NextResponse } from 'next/server';

/**
 * BFF 관련 설정 정보
 */
export interface BffInfo {
  backendUrl: string;
  bffSecret?: string;
  host: string;
  proto: string;
  port: string;
  isLocal: boolean;
}

/**
 * 현재 요청과 환경변수로부터 BFF 정보를 추출합니다.
 */
export function getBffInfo(request: NextRequest): BffInfo {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    throw new Error('[BFF] BACKEND_URL 환경변수가 설정되지 않았습니다.');
  }

  const isSecure = request.nextUrl.protocol === 'https:';

  // 환경변수 우선 사용, 없으면 현재 요청 정보 사용
  const host = process.env.BFF_LOCAL_HOST || request.nextUrl.host;
  const proto = (process.env.BFF_LOCAL_PROTO || request.nextUrl.protocol).replace(':', '');
  const port = process.env.BFF_LOCAL_PORT || request.nextUrl.port || (isSecure ? '443' : '80');

  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1') || proto === 'http';

  return {
    backendUrl: backendUrl.replace(/\/$/, ''),
    bffSecret: process.env.BFF_SECRET,
    host,
    proto,
    port,
    isLocal,
  };
}

/**
 * 백엔드 요청에 필요한 BFF 헤더를 생성합니다.
 */
export function getBffHeaders(info: BffInfo, extra?: HeadersInit): Record<string, string> {
  const headers: Record<string, string> = {};

  if (extra) {
    const extraHeaders = new Headers(extra);
    extraHeaders.forEach((value, key) => {
      // Host 헤더는 fetch가 targetUrl을 바탕으로 자동 생성해야 하므로 제외합니다.
      if (key.toLowerCase() === 'host') return;
      headers[key] = value;
    });
  }

  if (info.bffSecret) {
    headers['X-BFF-Secret'] = info.bffSecret;
  }
  headers['X-BFF-Host'] = info.host;
  headers['X-BFF-Proto'] = info.proto;
  headers['X-BFF-Port'] = info.port;

  // 호환성을 위한 X-Forwarded 헤더 추가
  headers['X-Forwarded-Host'] = info.host;
  headers['X-Forwarded-Proto'] = info.proto;
  headers['X-Forwarded-Port'] = info.port;

  return headers;
}

/**
 * 로컬 개발 환경(HTTP)에서 브라우저가 쿠키를 거부하지 않도록 수정합니다.
 */
export function rewriteCookieForLocal(cookie: string, isLocal: boolean): string {
  if (!isLocal) return cookie;

  return cookie
    .replace(/;\s*Secure\b/gi, '') // Secure 제거
    .replace(/;\s*SameSite=None/gi, '; SameSite=Lax') // SameSite=None은 Secure 필수이므로 Lax로 변경
    .replace(/;\s*Domain=[^;]+/gi, ''); // 도메인 설정이 localhost와 맞지 않을 수 있으므로 제거
}

/**
 * 백엔드 응답의 모든 Set-Cookie 헤더를 프론트엔드 응답으로 복사합니다.
 */
export function proxyCookies(
  backendResponse: Response,
  nextResponse: NextResponse,
  isLocal: boolean,
): void {
  // Edge Runtime에서도 동작하는 getSetCookie() 사용
  const cookies = backendResponse.headers.getSetCookie();

  if (cookies.length > 0) {
    cookies.forEach((cookie) => {
      const fixedCookie = rewriteCookieForLocal(cookie, isLocal);
      nextResponse.headers.append('set-cookie', fixedCookie);
    });
  }
}

/**
 * 백엔드 응답 바디에서 Access Token을 유연하게 추출합니다.
 */
export function extractAccessToken(body: any): string | null {
  if (!body || typeof body !== 'object') return null;

  // 다양한 응답 구조 대응
  if (body.accessToken) return body.accessToken;
  if (body.token) return body.token;
  if (body.access_token) return body.access_token;

  if (body.data && typeof body.data === 'object') {
    if (body.data.accessToken) return body.data.accessToken;
    if (body.data.token) return body.data.token;
  }

  return null;
}
