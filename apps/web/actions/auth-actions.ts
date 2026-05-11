'use server';

import { cookies } from 'next/headers';

import { fetchBackend } from '@/lib/api/client';
import { AUTH_TOKEN_KEY } from '@/lib/utils/auth-utils';
import { getMockUserInfo, User } from '@/lib/utils/user-mock';

/** 백엔드 로그아웃 응답 구조 */
interface BackendLogoutResponse {
  statusCode: string;
  message: string;
  data: null;
}

export interface LogoutActionResult {
  success: boolean;
  message?: string;
}

/**
 * 로그아웃 서버 액션
 *
 * 1. 쿠키에서 accessToken을 읽어 백엔드에 Authorization 헤더로 전달
 * 2. 백엔드에서 세션 무효화
 * 3. 서버에서 accessToken, refreshToken 쿠키 삭제 (HttpOnly 포함)
 */
export async function logoutAction(): Promise<LogoutActionResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_TOKEN_KEY)?.value;

  // 백엔드 세션 무효화 (accessToken이 있는 경우에만)
  if (accessToken) {
    try {
      const res = await fetchBackend('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        console.warn('[logoutAction] 백엔드 로그아웃 실패:', res.status, res.statusText);
      }
    } catch (error) {
      // 백엔드 실패는 무시 — 클라이언트 쿠키는 무조건 삭제
      console.warn('[logoutAction] 백엔드 로그아웃 요청 실패:', error);
    }
  }

  // 쿠키 삭제 (백엔드 성공/실패 무관)
  cookieStore.delete(AUTH_TOKEN_KEY);
  cookieStore.delete('refreshToken');

  return { success: true, message: '로그아웃 완료' };
}

export interface GetUserActionResult {
  success: boolean;
  user?: User | null;
}

/**
 * 유저 정보 조회 서버 액션
 *
 * 쿠키의 accessToken으로 현재 로그인한 유저 정보를 반환합니다.
 * 현재는 JWT 파싱 기반 Mock이며, 백엔드 /api/member/me 연동 시 교체합니다.
 */
export async function getUserAction(): Promise<GetUserActionResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_TOKEN_KEY)?.value;

  if (!accessToken) {
    return { success: false, user: null };
  }

  // TODO: 백엔드 /api/member/me 연동 시 아래 주석 해제
  // try {
  //   const res = await fetchBackend('/api/member/me', {
  //     headers: { Authorization: `Bearer ${accessToken}` },
  //     signal: AbortSignal.timeout(5000),
  //   });
  //   if (!res.ok) return { success: false, user: null };
  //   const body = await res.json();
  //   return { success: true, user: body.data };
  // } catch {
  //   return { success: false, user: null };
  // }

  const user = getMockUserInfo(accessToken);
  return { success: true, user };
}
