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
 * 현재 요청(있는 경우)과 환경변수로부터 BFF 정보를 추출합니다.
 */
export function getBffInfo(request?: NextRequest): BffInfo {
  // 클라이언트 사이드에서는 NEXT_PUBLIC_ 접두사가 붙은 것만 접근 가능
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '';

  // 서버 사이드에서 호출되었는데 백엔드 URL이 없으면 에러 (브라우저에서는 절대 경로 요청 가능하므로 허용)
  if (!backendUrl && typeof window === 'undefined') {
    throw new Error('[BFF] BACKEND_URL 환경변수가 설정되지 않았습니다.');
  }

  // 1. 환경변수 우선 사용
  let host = process.env.BFF_HOST || process.env.NEXT_PUBLIC_BFF_HOST;
  let proto = process.env.BFF_PROTO || process.env.NEXT_PUBLIC_BFF_PROTO;
  let port = process.env.BFF_PORT || process.env.NEXT_PUBLIC_BFF_PORT;

  // 2. 요청 객체 또는 브라우저 환경 정보가 있으면 보완
  if (request) {
    const isSecure = request.nextUrl.protocol === 'https:';
    host = host || request.nextUrl.host;
    proto = (proto || request.nextUrl.protocol).replace(':', '');
    port = port || request.nextUrl.port || (isSecure ? '443' : '80');
  } else if (typeof window !== 'undefined') {
    // 브라우저 환경인 경우 window.location 사용
    const isSecure = window.location.protocol === 'https:';
    host = host || window.location.host;
    proto = (proto || window.location.protocol).replace(':', '');
    port = port || window.location.port || (isSecure ? '443' : '80');
  }

  // 3. 최종 기본값 (fallback)
  host = host || 'localhost:3000';
  proto = (proto || 'http').replace(':', '');
  port = port || '3000';

  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1') || proto === 'http';

  return {
    backendUrl: backendUrl.replace(/\/$/, ''),
    bffSecret: process.env.BFF_SECRET || process.env.NEXT_PUBLIC_BFF_SECRET,
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
  nextResponse: NextResponse,
  isLocal: boolean,
): void {
  const fixedCookies = getProxyCookies(backendResponse, isLocal);
  fixedCookies.forEach((cookie) => {
    nextResponse.headers.append('set-cookie', cookie);
  });
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
