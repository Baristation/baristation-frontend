'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { getUserAction, logoutAction } from '@/actions/auth-actions';
import { User } from '@/lib/utils/user-mock';

export type { User };

/**
 * 전역 인증 상태를 관리하는 훅
 *
 * [아키텍처]
 * - fetchUser, logout 모두 Server Action을 통해 처리
 * - BFF Secret 등 민감 정보가 브라우저에 노출되지 않음
 * - HttpOnly 쿠키 삭제도 서버 액션에서 처리
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  /**
   * Server Action을 통해 인증 상태와 유저 정보를 갱신합니다.
   * - 미인증 → user: null, isAuthenticated: false
   * - 인증됨 → user 설정, isAuthenticated: true
   */
  const fetchUser = useCallback(async () => {
    try {
      const result = await getUserAction();

      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 로그아웃 Server Action 호출
   * 1. 서버에서 백엔드 세션 무효화 (Authorization: Bearer {accessToken})
   * 2. 서버에서 accessToken, refreshToken HttpOnly 쿠키 삭제
   * 3. 클라이언트 상태 초기화 및 로그인 페이지로 이동
   */
  const logout = useCallback(async () => {
    try {
      await logoutAction();
    } catch (error) {
      console.warn('[useAuth] 로그아웃 실패:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    fetchUser();

    /**
     * 탭 포커스 시 인증 상태 재검증
     * 다른 탭에서 로그아웃/로그인한 경우 동기화
     */
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUser();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchUser]);

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    /** 수동으로 인증 상태를 재검증 (예: 로그인 직후 호출) */
    revalidate: fetchUser,
  };
}
