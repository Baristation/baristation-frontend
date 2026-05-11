'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { refreshAction } from '@/actions/auth.action';

/**
 * AuthSuccessPage — OAuth 인증 환승역 페이지
 *
 * [동작 원리]
 * 이 페이지 자체는 거의 보이지 않습니다.
 * middleware.ts가 /auth/success 요청을 가로채어 토큰 교환 후 목적지로 리다이렉트합니다.
 *
 * [안전장치]
 * 미들웨어가 어떤 이유로 스킵된 경우를 대비해,
 * 클라이언트에서 refreshAction 서버 액션을 직접 호출하는 폴백 로직을 제공합니다.
 */
export default function AuthSuccessPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // 미들웨어 스킵 감지용 안전장치
    // 미들웨어가 정상 처리했다면 이 코드는 실행되지 않음 (이미 리다이렉트됨)
    const fallbackRefresh = async () => {
      try {
        const result = await refreshAction();

        if (result.success) {
          // 리다이렉트 쿠키에서 목적지 추출
          const redirectMatch = document.cookie
            .split('; ')
            .find((row) => row.startsWith('baristation-redirect-to='));
          const redirectTo = redirectMatch ? decodeURIComponent(redirectMatch.split('=')[1]) : '/';

          router.replace(redirectTo);
        } else {
          throw new Error(result.error || '토큰 재발급 실패');
        }
      } catch (err) {
        console.error('[AuthSuccess] 안전장치 토큰 재발급 실패:', err);
        setErrorMessage(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        setStatus('error');

        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.replace('/login?error=middleware_skipped');
        }, 3000);
      }
    };

    // 미들웨어가 즉시 리다이렉트하지 않은 경우에만 폴백 실행
    const timer = setTimeout(fallbackRefresh, 500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="relative flex h-dvh flex-col items-center justify-center overflow-hidden bg-[#1A1614]">
      {/* 배경 그레인 오버레이 */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        {status === 'loading' ? (
          <>
            {/* 프리미엄 스피너 */}
            <div className="relative flex items-center justify-center">
              {/* 외곽 링 */}
              <motion.div
                className="h-16 w-16 rounded-full border border-white/10"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              {/* 진행 호 */}
              <motion.div
                className="absolute h-16 w-16 rounded-full border-t border-r border-amber-400/60"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              />
              {/* 중앙 점 */}
              <motion.div
                className="absolute h-2 w-2 rounded-full bg-amber-400"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* 텍스트 */}
            <div className="flex flex-col items-center gap-2 text-center">
              <h1
                className="text-xl font-bold text-white/90"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Finalizing Security
              </h1>
              <motion.p
                className="text-xs tracking-[0.25em] text-white/40 uppercase"
                style={{ fontFamily: "'Outfit', sans-serif" }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                Authenticating your session
              </motion.p>
            </div>
          </>
        ) : (
          <>
            {/* 에러 상태 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  />
                </svg>
              </div>

              <div className="flex flex-col gap-1">
                <h1
                  className="text-base font-semibold text-white/80"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  인증 처리 중 오류가 발생했습니다
                </h1>
                {errorMessage && <p className="max-w-xs text-xs text-white/30">{errorMessage}</p>}
                <p
                  className="mt-2 text-xs tracking-[0.2em] text-white/25 uppercase"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Redirecting to login...
                </p>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* 하단 브랜드 */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute bottom-6 flex w-full items-center justify-center"
      >
        <p className="text-[10px] text-white/20" style={{ fontFamily: "'Outfit', sans-serif" }}>
          © {new Date().getFullYear()} Baristation. All rights reserved.
        </p>
      </motion.footer>
    </main>
  );
}
