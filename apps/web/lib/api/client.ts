import { NextRequest } from 'next/server';

import { getBffHeaders, getBffInfo } from '@/lib/utils/bff-utils';

/**
 * 백엔드 전용 fetch 래퍼
 * 모든 요청에 BFF 필수 헤더를 자동으로 주입합니다.
 *
 * @param endpoint - 백엔드 API 엔드포인트 (예: '/api/v1/user')
 * @param options - fetch 옵션 (NextRequest를 bffRequest로 전달 가능)
 */
export async function fetchBackend(
  endpoint: string,
  options: RequestInit & { bffRequest?: NextRequest } = {},
): Promise<Response> {
  const { bffRequest, ...fetchOptions } = options;

  // 1. BFF 정보 가져오기
  const bffInfo = getBffInfo(bffRequest);

  // 2. 기본 헤더 설정
  const extraHeaders: Record<string, string> = {
    Accept: 'application/json',
  };

  // 3. 서버 사이드 컨텍스트(Server Component, Action, API Route)인 경우 쿠키 자동 주입 시도
  if (!bffRequest) {
    try {
      // next/headers는 서버 런타임에서만 동적으로 임포트 가능 (브라우저/미들웨어 호환성 고려)
      const { cookies, headers } = await import('next/headers');
      const cookieList = await cookies();
      const headerList = await headers();

      const cookie = cookieList.toString();
      if (cookie) {
        extraHeaders['Cookie'] = cookie;
      }

      // 필요한 경우 User-Agent 등 추가 헤더 전달
      const ua = headerList.get('user-agent');
      if (ua) extraHeaders['User-Agent'] = ua;
    } catch (e) {
      // headers()를 사용할 수 없는 환경(Middleware 등)은 무시
    }
  } else {
    // Middleware에서 호출된 경우 전달받은 request의 쿠키 사용
    const cookie = bffRequest.headers.get('cookie');
    if (cookie) extraHeaders['Cookie'] = cookie;
  }

  // 4. BFF 헤더와 병합
  const finalHeaders = getBffHeaders(bffInfo, {
    ...extraHeaders,
    ...(fetchOptions.headers as Record<string, string>),
  });

  // 5. URL 조립
  const baseUrl = bffInfo.backendUrl;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${path}`;

  // 6. 요청 실행
  return fetch(url, {
    ...fetchOptions,
    headers: finalHeaders,
  });
}
