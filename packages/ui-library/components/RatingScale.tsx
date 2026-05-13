'use client';

import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import * as React from 'react';

/**
 * 단계별 컬러 팔레트 정의 (Standard Metric Colors)
 */
const PALETTES = {
  amber: {
    scale: ['#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B', '#D97706'],
    glow: 'rgba(217, 119, 6, 0.4)', // Amber-600 with opacity
    bg: 'bg-amber-500',
    hover: 'hover:bg-amber-600',
    border: 'border-amber-200/50',
  },
  espresso: {
    scale: ['#D7CCC8', '#BCAAA4', '#8D6E63', '#6D4C41', '#4E342E'],
    glow: 'rgba(78, 52, 46, 0.4)', // Espresso-600 with opacity
    bg: 'bg-stone-600',
    hover: 'hover:bg-stone-700',
    border: 'border-stone-200/50',
  },
  teal: {
    scale: ['#CCFBF1', '#5EEAD4', '#14B8A6', '#0D9488', '#134E4A'],
    glow: 'rgba(13, 148, 136, 0.4)', // Teal-600 with opacity
    bg: 'bg-teal-500',
    hover: 'hover:bg-teal-600',
    border: 'border-teal-200/50',
  },
  red: {
    scale: ['#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444'],
    glow: 'rgba(239, 68, 68, 0.4)', // Red-500 with opacity
    bg: 'bg-red-500',
    hover: 'hover:bg-red-600',
    border: 'border-red-200/50',
  },
  blue: {
    scale: ['#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6'],
    glow: 'rgba(59, 130, 246, 0.4)', // Blue-500 with opacity
    bg: 'bg-blue-500',
    hover: 'hover:bg-blue-600',
    border: 'border-blue-200/50',
  },
  green: {
    scale: ['#DCFCE7', '#BBF7D0', '#86EFAC', '#4ADE80', '#22C55E'],
    glow: 'rgba(34, 197, 94, 0.4)', // Green-500 with opacity
    bg: 'bg-green-500',
    hover: 'hover:bg-green-600',
    border: 'border-green-200/50',
  },
  stone: {
    scale: ['#F5F5F4', '#E7E5E4', '#D6D3D1', '#A8A29E', '#78716C'],
    glow: 'rgba(120, 113, 108, 0.4)',
    bg: 'bg-stone-500',
    hover: 'hover:bg-stone-600',
    border: 'border-stone-200/50',
  },
} as const;

export type ColorPalette = keyof typeof PALETTES;

export interface RatingScaleProps {
  /** 최대 평점 (보통 5) */
  max?: number;
  /** 현재 선택된 평점 */
  value: number;
  /** 평점 변경 콜백 */
  onChange?: (value: number) => void;
  /** 컴포넌트 크기 및 스타일 변형 */
  variant?: 'sm' | 'md' | 'indicator';
  /** 컬러 팔레트 선택 */
  colorPalette?: ColorPalette;
  /** 읽기 전용 여부 */
  readOnly?: boolean;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 평점별 컬러 및 스타일 추출 유틸리티
 */
const getRatingStyles = (
  n: number,
  max: number,
  palette: ColorPalette,
  isPremium: boolean = false,
) => {
  const theme = PALETTES[palette];
  const colorIndex = max === 5 ? n - 1 : Math.floor(((n - 1) * 5) / max);
  const color = theme.scale[colorIndex] ?? theme.scale[theme.scale.length - 1];

  if (isPremium) {
    return { color, glow: theme.glow };
  }

  // 기본 모드에서는 팔레트별 단계 특화 Tailwind 클래스 (옵션)
  // 현재는 정교한 제어를 위해 최상단 scale 데이터를 animate에 직접 사용함
  return { color, glow: theme.glow };
};

const RatingScale = ({
  max = 5,
  value,
  onChange,
  variant = 'md',
  colorPalette = 'amber',
  readOnly = false,
  className,
}: RatingScaleProps) => {
  const isIndicator = variant === 'indicator';
  const isReadOnly = readOnly || isIndicator || !onChange;
  const theme = PALETTES[colorPalette];

  return (
    <div
      className={cn(
        'flex w-full gap-1 rounded-md bg-transparent',
        isReadOnly && 'pointer-events-none',
        className,
      )}
      aria-label={isReadOnly ? `평점: ${value} / ${max}` : undefined}
      role={isReadOnly ? 'img' : 'group'}
      aria-roledescription={!isReadOnly ? '평점 선택기' : undefined}
    >
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
        const isActive = n <= value;
        const { color, glow } = getRatingStyles(n, max, colorPalette, isReadOnly);

        if (isReadOnly) {
          return (
            <motion.div
              key={n}
              initial={false}
              animate={{
                backgroundColor: isActive ? color : 'rgba(156, 163, 175, 0.15)',
                boxShadow: isActive && isIndicator ? `0 0 10px ${glow}` : 'none',
              }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={cn(
                'flex-1 rounded',
                isIndicator ? 'h-1.5 rounded-full' : variant === 'md' ? 'h-7' : 'h-8',
                isActive && isIndicator && 'border border-white/10 saturate-[1.2]',
              )}
            >
              {isActive && isIndicator && (
                <div className="h-full w-full rounded-full bg-gradient-to-r from-white/20 to-transparent" />
              )}
            </motion.div>
          );
        }

        return (
          <motion.button
            key={n}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange?.(value === n ? 0 : n)}
            initial={
              isActive
                ? false
                : {
                    backgroundColor: 'rgb(255, 255, 255)',
                    borderColor: 'rgba(229, 231, 235, 0.5)',
                  }
            }
            animate={{
              backgroundColor: isActive ? color : 'rgb(249, 250, 251)', // bg-gray-50
              borderColor: isActive ? 'transparent' : 'rgba(229, 231, 235, 0.8)', // border-gray-200
            }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'flex-1 cursor-pointer rounded border transition-colors',
              isActive ? 'shadow-sm' : 'hover:bg-gray-100',
              variant === 'md' ? 'h-7' : 'h-8',
            )}
            aria-label={`${n}점 선택`}
            aria-pressed={isActive}
          />
        );
      })}
    </div>
  );
};

RatingScale.displayName = 'RatingScale';

export { RatingScale };
