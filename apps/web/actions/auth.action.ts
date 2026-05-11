'use server';

import { cookies } from 'next/headers';

import { fetchBackend, refreshTokens } from '@/lib/api/backend';
import { AUTH_TOKEN_KEY } from '@/lib/utils/auth';
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

export interface RefreshActionResult {
  success: boolean;
  accessToken?: string;
  error?: string;
}

/**
 * 토큰 재발급 서버 액션
 *
 * 브라우저에 저장된 refreshToken 쿠키를 사용하여 새로운 accessToken을 발급받습니다.
 */
export async function refreshAction(): Promise<RefreshActionResult> {
  try {
    const result = await refreshTokens();

    const cookieStore = await cookies();
    const isSecure = process.env.BFF_PROTO === 'https';

    // 1. 새로운 Access Token 설정
    cookieStore.set(AUTH_TOKEN_KEY, result.accessToken, {
      path: '/',
      secure: isSecure,
      sameSite: 'lax',
      // 수명은 백엔드 설정에 따르거나 적절히 설정 (예: 30분)
      maxAge: 60 * 30,
    });

    // TODO: 백엔드에서 내려온 추가 쿠키(Set-Cookie) 처리가 필요한 경우
    // result.setCookies 리스트를 파싱하여 cookieStore.set()으로 설정할 수 있습니다.

    return {
      success: true,
      accessToken: result.accessToken,
    };
  } catch (error: any) {
    console.error('[refreshAction] 토큰 재발급 실패:', error);
    return {
      success: false,
      error: error.message || '토큰 재발급에 실패했습니다.',
    };
  }
}
