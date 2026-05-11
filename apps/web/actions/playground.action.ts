'use server';

import { fetchBackend } from '@/lib/api/backend';

export interface PlaygroundResponse {
  status: number;
  statusText: string;
  time: string;
  body: any;
  headers: Record<string, string>;
}

export interface PlaygroundActionResult {
  success: boolean;
  data?: PlaygroundResponse;
  error?: string;
}

/**
 * Playground 전용 서버 액션
 * 클라이언트에서 백엔드로 직접 요청하지 않고, 서버를 거쳐 요청함으로써
 * BFF Secret 등의 민감 정보가 브라우저에 노출되는 것을 방지합니다.
 */
export async function executePlaygroundRequest(
  url: string,
  method: string,
): Promise<PlaygroundActionResult> {
  try {
    const start = Date.now();

    // fetchBackend는 서버 사이드에서 실행되므로 process.env에 안전하게 접근합니다.
    const res = await fetchBackend(url, {
      method,
      cache: 'no-store',
    });

    const latency = Date.now() - start;
    const contentType = res.headers.get('content-type');

    let body;
    try {
      if (contentType?.includes('application/json')) {
        body = await res.json();
      } else {
        body = await res.text();
      }
    } catch (e) {
      body = '(바디 파싱 실패)';
    }

    return {
      success: true,
      data: {
        status: res.status,
        statusText: res.statusText,
        time: `${latency}ms`,
        body,
        headers: Object.fromEntries(res.headers.entries()),
      },
    };
  } catch (error: any) {
    console.error('[PlaygroundAction] Request Error:', error);
    return {
      success: false,
      error: error.message || '요청 수행 중 오류가 발생했습니다.',
    };
  }
}
