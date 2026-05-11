import { NextRequest } from 'next/server';

// ─────────────────────────────────────────────────────────────
// Private: BFF 설정 (외부 노출 없음)
// ─────────────────────────────────────────────────────────────

interface BffInfo {
  backendUrl: string;
  bffSecret?: string;
  host: string;
  proto: string;
  port: string;
  isLocal: boolean;
}

function getBffInfo(request?: NextRequest): BffInfo {
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '';

  if (!backendUrl && typeof window === 'undefined') {
    throw new Error('[BFF] BACKEND_URL 환경변수가 설정되지 않았습니다.');
  }

  let host = process.env.BFF_HOST || process.env.NEXT_PUBLIC_BFF_HOST;
  let proto = process.env.BFF_PROTO || process.env.NEXT_PUBLIC_BFF_PROTO;
  let port = process.env.BFF_PORT || process.env.NEXT_PUBLIC_BFF_PORT;

  if (request) {
    const isSecure = request.nextUrl.protocol === 'https:';
    host = host || request.nextUrl.host;
    proto = (proto || request.nextUrl.protocol).replace(':', '');
    port = port || request.nextUrl.port || (isSecure ? '443' : '80');
  } else if (typeof window !== 'undefined') {
    const isSecure = window.location.protocol === 'https:';
    host = host || window.location.host;
    proto = (proto || window.location.protocol).replace(':', '');
    port = port || window.location.port || (isSecure ? '443' : '80');
  }

  host = host || 'localhost:3000';
  proto = (proto || 'http').replace(':', '');
  port = port || '3000';

  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1') || proto === 'http';

  const bffSecret = process.env.BFF_SECRET;
  if (!bffSecret && typeof window === 'undefined') {
    throw new Error('[BFF] BFF_SECRET 환경변수가 설정되지 않았습니다.');
  }

  return {
    backendUrl: backendUrl.replace(/\/$/, ''),
    bffSecret,
    host,
    proto,
    port,
    isLocal,
  };
}

function buildBffHeaders(info: BffInfo, extra?: HeadersInit): Record<string, string> {
  const headers: Record<string, string> = {};

  if (extra) {
    const extraHeaders = new Headers(extra);
    extraHeaders.forEach((value, key) => {
      if (key.toLowerCase() === 'host') return;
      headers[key] = value;
    });
  }

  if (info.bffSecret) headers['X-BFF-Secret'] = info.bffSecret;
  headers['X-BFF-Host'] = info.host;
  headers['X-BFF-Proto'] = info.proto;
  headers['X-BFF-Port'] = info.port;
  headers['X-Forwarded-Host'] = info.host;
  headers['X-Forwarded-Proto'] = info.proto;
  headers['X-Forwarded-Port'] = info.port;

  return headers;
}

// ─────────────────────────────────────────────────────────────
// Public: 백엔드 기본 URL
// ─────────────────────────────────────────────────────────────

/**
 * 백엔드 기본 URL을 반환합니다.
 * OAuth 리다이렉트 등 절대 URL 구성이 필요한 경우 사용합니다.
 */
export function getBackendBaseUrl(): string {
  return (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
}

// ─────────────────────────────────────────────────────────────
// Public: fetchBackend
// ─────────────────────────────────────────────────────────────

/**
 * 백엔드 전용 fetch 래퍼.
 * 모든 요청에 BFF 필수 헤더를 자동으로 주입합니다.
 *
 * @param endpoint - 백엔드 API 엔드포인트 (예: '/api/v1/user') 또는 절대 URL
 * @param options  - fetch 옵션. Middleware에서 호출 시 `bffRequest`에 요청 객체 전달
 */
export async function fetchBackend(
  endpoint: string,
  options: RequestInit & { bffRequest?: NextRequest } = {},
): Promise<Response> {
  const { bffRequest, ...fetchOptions } = options;
  const bffInfo = getBffInfo(bffRequest);

  const extraHeaders: Record<string, string> = { Accept: 'application/json' };

  if (!bffRequest) {
    try {
      const { cookies, headers } = await import('next/headers');
      const cookieList = await cookies();
      const headerList = await headers();
      const cookie = cookieList.toString();
      if (cookie) extraHeaders['Cookie'] = cookie;
      const ua = headerList.get('user-agent');
      if (ua) extraHeaders['User-Agent'] = ua;
    } catch {
      // Middleware 등 headers()를 사용할 수 없는 환경은 무시
    }
  } else {
    const cookie = bffRequest.headers.get('cookie');
    if (cookie) extraHeaders['Cookie'] = cookie;
  }

  const finalHeaders = buildBffHeaders(bffInfo, {
    ...extraHeaders,
    ...(fetchOptions.headers as Record<string, string>),
  });

  if (/^https?:\/\//i.test(endpoint)) {
    throw new Error(
      '[BFF] 절대 URL(http:// 또는 https://)을 통한 백엔드 요청은 보안상 허용되지 않습니다.',
    );
  }

  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${bffInfo.backendUrl}${path}`;

  return fetch(url, { ...fetchOptions, headers: finalHeaders });
}

// ─────────────────────────────────────────────────────────────
// Public: refreshTokens (구 authService.refreshAccessToken)
// ─────────────────────────────────────────────────────────────

export interface RefreshResult {
  accessToken: string;
  /** 백엔드가 발급한 모든 Set-Cookie 헤더 목록 */
  setCookies: string[];
  message: string;
}

interface BackendRefreshResponse {
  status: string;
  message: string;
  data: { accessToken: string } | null;
}

/**
 * refreshToken 쿠키를 사용하여 새로운 accessToken을 발급받습니다.
 *
 * @param bffRequest - (옵션) Middleware에서 호출 시 현재 요청 객체
 * @throws Error - 네트워크 오류, 백엔드 오류 등
 */
export async function refreshTokens(bffRequest?: NextRequest): Promise<RefreshResult> {
  let response: Response;
  try {
    response = await fetchBackend('/api/auth/refresh', {
      method: 'POST',
      bffRequest,
      signal: AbortSignal.timeout(5000),
    });
  } catch (networkError) {
    throw new Error(`[Backend] 네트워크 오류: ${String(networkError)}`);
  }

  if (!response.ok) {
    let errorDetail = '';
    try {
      errorDetail = await response.text();
    } catch {
      errorDetail = '(응답 body 없음)';
    }
    console.error(`[Backend] 토큰 재발급 실패 | Status: ${response.status}`, {
      statusText: response.statusText,
      body: errorDetail,
    });
    throw new Error(`백엔드 토큰 재발급 실패 (HTTP ${response.status}): ${errorDetail}`);
  }

  let body: BackendRefreshResponse;
  try {
    body = await response.json();
  } catch (e) {
    console.error('[Backend] JSON 파싱 에러:', e);
    throw new Error('백엔드 응답 데이터 형식이 올바르지 않습니다.');
  }

  if (!body.data?.accessToken) {
    console.error('[Backend] 액세스 토큰 누락:', body);
    throw new Error(`토큰 발급 실패: ${body.message || '데이터 구조 오류'}`);
  }

  return {
    accessToken: body.data.accessToken,
    setCookies: response.headers.getSetCookie(),
    message: body.message || 'Success',
  };
}
