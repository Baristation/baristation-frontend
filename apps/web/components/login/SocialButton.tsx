'use client';

import { Button } from '@coffee-service/ui-library';
import { motion } from 'framer-motion';
import React from 'react';

import { REDIRECT_COOKIE_KEY, isValidInternalPath } from '@/lib/utils/auth';

export type SocialProvider = 'google' | 'naver' | 'kakao';

interface SocialButtonProps {
  provider: SocialProvider;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 3c-4.97 0-9 3.119-9 6.967 0 2.492 1.64 4.675 4.103 5.918-.163.606-.59 2.193-.675 2.51-.104.385.135.38.284.282.117-.077 1.874-1.272 2.628-1.785.114.016.23.03.348.038.775.053 1.579.08 2.312.08 4.97 0 9-3.119 9-6.967S16.97 3 12 3z" />
    </svg>
  );
}

const PROVIDER_MAP: Record<
  SocialProvider,
  { label: string; icon: React.ReactNode; variant: 'google' | 'naver' | 'kakao' }
> = {
  google: {
    label: 'Google 계정으로 로그인',
    icon: <GoogleIcon />,
    variant: 'google',
  },
  naver: {
    label: '네이버 로그인',
    icon: <NaverIcon />,
    variant: 'naver',
  },
  kakao: {
    label: '카카오 로그인',
    icon: <KakaoIcon />,
    variant: 'kakao',
  },
};

/**
 * SocialButton - 소셜 플랫폼별 OAuth 로그인 트리거 버튼
 * - 각 플랫폼의 공식 브랜드 가이드라인 준수
 * - 실제 OAuth2 Authorization 경로로 리다이렉트 (스펙 6.1)
 */
export default function SocialButton({ provider }: SocialButtonProps) {
  const { label, icon, variant } = PROVIDER_MAP[provider];

  const handleLogin = () => {
    // 1. 현재 페이지의 redirect 쿼리 파라미터 추출
    const searchParams = new URLSearchParams(window.location.search);
    const rawRedirect = searchParams.get('redirect');

    // 2. 오픈 리다이렉트 방지를 위해 내부 경로 여부 검증 및 정규화
    let redirectTarget = '/';
    if (rawRedirect && isValidInternalPath(rawRedirect)) {
      try {
        // 경로와 쿼리 스트링만 남기고 정규화 (보안 강화)
        const url = new URL(rawRedirect, window.location.origin);
        redirectTarget = url.pathname + url.search;
      } catch {
        redirectTarget = '/';
      }
    }

    // 3. 목적지를 쿠키에 안전하게 저장 (미들웨어에서 읽어 최종 리다이렉트)
    const isSecure = window.location.protocol === 'https:';
    const encodedRedirect = encodeURIComponent(redirectTarget);
    document.cookie = `${REDIRECT_COOKIE_KEY}=${encodedRedirect}; path=/; max-age=3600; SameSite=Lax${
      isSecure ? '; Secure' : ''
    }`;

    // 4. BFF Route Handler를 통한 OAuth2 인증 시작
    //    - /api/auth/[provider]/route.ts가 백엔드 도메인을 은닉
    //    - HTTP(localhost) 환경에서 Secure 쿠키 플래그 제거 (Cookie Laundry)
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <motion.div variants={itemVariants} className="mb-3 w-full shrink-0">
      <Button variant={variant} size="xl" className="w-full gap-3" onClick={handleLogin}>
        {icon}
        {label}
      </Button>
    </motion.div>
  );
}
