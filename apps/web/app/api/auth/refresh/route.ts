import { NextRequest, NextResponse } from 'next/server';

import { authService } from '@/lib/services/auth-service';
import { getBffInfo, rewriteCookieForLocal } from '@/lib/utils/bff-utils';

/**
 * BFF (Backend For Frontend) Token Refresh Handler
 * - 클라이언트 앱에서 401 에러 감지 시 수동으로 호출 가능
 */
export async function POST(request: NextRequest) {
  try {
    const bffInfo = getBffInfo(request);
    const result = await authService.refreshAccessToken(request);

    const res = NextResponse.json({
      accessToken: result.accessToken,
      message: result.message,
    });

    // 백엔드가 준 모든 쿠키(토큰 회전 포함)를 브라우저로 전달
    result.setCookies.forEach((cookie) => {
      res.headers.append('set-cookie', rewriteCookieForLocal(cookie, bffInfo.isLocal));
    });

    return res;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Refresh API] 토큰 갱신 실패:`, errorMsg);

    return NextResponse.json(
      {
        error: 'Authentication refresh failed',
        details: errorMsg,
      },
      { status: 500 },
    );
  }
}
