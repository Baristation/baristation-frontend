import { NextRequest, NextResponse } from 'next/server';

import { AUTH_TOKEN_KEY } from '@/lib/utils/auth-utils';
import { getBffInfo, getBffHeaders } from '@/lib/utils/bff-utils';

/**
 * DELETE /api/auth/logout
 *
 * 로그아웃 처리:
 * 1. accessToken 쿠키 삭제 (일반 쿠키)
 * 2. refreshToken 쿠키 삭제 (HttpOnly — 서버에서만 삭제 가능)
 * 3. (선택) 백엔드에 refreshToken 무효화 요청
 */
export async function DELETE(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const bffInfo = getBffInfo(request);
  const isSecure = request.nextUrl.protocol === 'https:';

  // [선택] 백엔드에 refreshToken 무효화 요청
  // refreshToken이 서버에서 블랙리스트 처리되어야 완전한 로그아웃이 됩니다.
  if (refreshToken && bffInfo.backendUrl) {
    try {
      const bffHeaders = getBffHeaders(bffInfo, {
        Cookie: `refreshToken=${refreshToken}`,
      });

      await fetch(`${bffInfo.backendUrl}/api/auth/logout`, {
        method: 'POST',
        headers: bffHeaders,
        signal: AbortSignal.timeout(5000),
      });
    } catch (error) {
      // 백엔드 로그아웃 실패는 무시 (클라이언트 쿠키는 무조건 삭제)
      console.warn('[Logout API] Backend logout request failed:', error);
    }
  }

  const response = NextResponse.json({ message: '로그아웃 완료' }, { status: 200 });

  // accessToken 쿠키 삭제
  response.cookies.set(AUTH_TOKEN_KEY, '', {
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
    secure: isSecure,
  });

  // refreshToken 쿠키 삭제 (HttpOnly이므로 서버에서만 삭제 가능)
  response.cookies.set('refreshToken', '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure,
  });

  return response;
}
