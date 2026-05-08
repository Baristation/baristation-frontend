import { NextRequest, NextResponse } from 'next/server';

import { AUTH_TOKEN_KEY } from '@/lib/utils/auth-utils';

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
  const isSecure = request.nextUrl.protocol === 'https:';

  // [선택] 백엔드에 refreshToken 무효화 요청
  // refreshToken이 서버에서 블랙리스트 처리되어야 완전한 로그아웃이 됩니다.
  // 현재 백엔드 로그아웃 API가 없다면 아래 코드를 주석 처리하세요.
  if (refreshToken && process.env.BACKEND_URL) {
    try {
      const bffHeaders: Record<string, string> = {
        Cookie: `refreshToken=${refreshToken}`,
      };

      if (process.env.BFF_SECRET) {
        bffHeaders['X-BFF-Secret'] = process.env.BFF_SECRET;
      }

      await fetch(`${process.env.BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: bffHeaders,
        signal: AbortSignal.timeout(3000),
      });
    } catch (error) {
      // 백엔드 로그아웃 실패는 무시 (클라이언트 쿠키는 무조건 삭제)
      console.warn('[Logout] 백엔드 로그아웃 요청 실패:', error);
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
