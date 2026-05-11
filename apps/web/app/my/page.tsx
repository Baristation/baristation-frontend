'use client';

import { motion } from 'framer-motion';
import { LogOut, User, Shield, Key, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { useAuth } from '@/hooks/use-auth';

/**
 * /my — 인증 테스트 페이지 (Protected)
 *
 * middleware.ts의 PROTECTED_PATHS에 '/my'가 포함되어 있어야 합니다.
 * 미인증 유저가 접근하면 자동으로 /login?redirect=/my 로 이동합니다.
 */
export default function MyPage() {
  const { user, isAuthenticated, isLoading, logout, revalidate } = useAuth();
  const [isTokenPresent, setIsTokenPresent] = useState(false);

  useEffect(() => {
    // 마운트 및 인증 상태 변경 시 클라이언트에서 쿠키 존재 여부 확인
    setIsTokenPresent(document.cookie.includes('baristation-auth-token='));
  }, [isAuthenticated]);

  return (
    <main className="min-h-dvh bg-[#1A1614] p-6 pt-24">
      <div className="mx-auto max-w-2xl">
        {/* 페이지 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-medium tracking-widest text-amber-400 uppercase">
              Protected Route
            </span>
          </div>
          <h1
            className="text-3xl font-bold text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            인증 상태 테스트
          </h1>
          <p className="mt-1 text-sm text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
            이 페이지는 로그인한 유저만 접근할 수 있습니다.
          </p>
        </motion.div>

        {/* 인증 상태 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                isAuthenticated
                  ? 'border border-emerald-500/30 bg-emerald-500/10'
                  : 'border border-red-500/30 bg-red-500/10'
              }`}
            >
              <Shield
                className={`h-5 w-5 ${isAuthenticated ? 'text-emerald-400' : 'text-red-400'}`}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-white">인증 상태</p>
              <p className={`text-xs ${isAuthenticated ? 'text-emerald-400' : 'text-red-400'}`}>
                {isLoading ? '확인 중...' : isAuthenticated ? '✓ 인증됨' : '✗ 미인증'}
              </p>
            </div>
          </div>

          {/* 유저 정보 */}
          {user && (
            <div className="mt-4 space-y-2 rounded-xl border border-white/5 bg-white/3 p-4">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <User className="h-3.5 w-3.5" />
                <span className="font-medium text-white/80">유저 정보</span>
              </div>
              <div className="space-y-1 pl-5">
                <InfoRow label="ID" value={user.id} />
                <InfoRow label="이름" value={user.name} />
                {user.email && <InfoRow label="이메일" value={user.email} />}
              </div>
            </div>
          )}
        </motion.div>

        {/* 쿠키 상태 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
        >
          <div className="mb-3 flex items-center gap-2 text-xs text-white/60">
            <Key className="h-3.5 w-3.5" />
            <span className="font-medium text-white/80">토큰 상태 (클라이언트 기준)</span>
          </div>
          <div className="space-y-2">
            <CookieRow name="baristation-auth-token" present={isTokenPresent} httpOnly={false} />
            <CookieRow
              name="refreshToken"
              present={null} // HttpOnly — JS에서 감지 불가
              httpOnly={true}
            />
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-white/25">
            * HttpOnly 쿠키는 JavaScript에서 접근 불가 (DevTools → Application → Cookies에서 확인)
          </p>
        </motion.div>

        {/* 액션 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col gap-3"
        >
          <button
            onClick={revalidate}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            인증 상태 재검증
          </button>

          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 transition-colors hover:bg-red-500/20"
          >
            <LogOut className="h-4 w-4" />
            로그아웃 (쿠키 완전 삭제)
          </button>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-center text-sm text-white/40 transition-colors hover:text-white/60"
          >
            ← 메인으로 돌아가기
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="w-16 shrink-0 text-[11px] text-white/40">{label}</span>
      <span className="font-mono text-xs break-all text-white/70">{value}</span>
    </div>
  );
}

function CookieRow({
  name,
  present,
  httpOnly,
}: {
  name: string;
  present: boolean | null;
  httpOnly: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/3 px-3 py-2">
      <div>
        <p className="font-mono text-xs text-white/70">{name}</p>
        <p className="text-[10px] text-white/30">
          {httpOnly ? 'HttpOnly · JS 접근 불가' : '일반 쿠키 · JS 읽기 가능'}
        </p>
      </div>
      {present === null ? (
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/30">
          감지 불가
        </span>
      ) : present ? (
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
          존재
        </span>
      ) : (
        <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] text-red-400">
          없음
        </span>
      )}
    </div>
  );
}
