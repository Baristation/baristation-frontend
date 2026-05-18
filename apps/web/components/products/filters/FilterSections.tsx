'use client';

import { RangeSlider, Tooltip } from '@coffee-service/ui-library';
import { motion } from 'framer-motion';
import { LucideIcon, Flame } from 'lucide-react';
import React from 'react';

import { FLAVOR_DEFINITIONS, FlavorType, ProductFilterState } from '@/lib/api/products';

export const SECTION_TITLE =
  'font-outfit mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400';

/**
 * 향미 선택 섹션
 */
interface FlavorFilterProps {
  selectedFlavors: FlavorType[];
  onToggle: (flavor: FlavorType) => void;
}

export function FlavorFilter({ selectedFlavors, onToggle }: FlavorFilterProps) {
  return (
    <div className="py-2">
      <p className={SECTION_TITLE}>향미</p>
      <div className="grid grid-cols-5 gap-2 md:grid-cols-4">
        {FLAVOR_DEFINITIONS.map((def) => {
          const active = selectedFlavors.includes(def.id);
          return (
            <Tooltip key={def.id} content={def.ko}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggle(def.id)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all ${
                  active
                    ? 'bg-amber-100/80 text-amber-600 shadow-sm ring-1 ring-amber-500/20'
                    : 'bg-gray-50 text-gray-400 hover:bg-white hover:shadow-md'
                }`}
              >
                {def.emoji}
              </motion.button>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 수치 지표 필터 (슬라이더)
 */
interface MetricFilterProps {
  label: string;
  icon: LucideIcon;
  value: [number, number];
  min?: number;
  max?: number;
  step?: number;
  colorPalette?: 'amber' | 'teal' | 'espresso';
  onChange: (value: [number, number]) => void;
}

export function MetricFilter({
  label,
  icon: Icon,
  value,
  min = 1,
  max = 5,
  step = 1,
  colorPalette = 'amber',
  onChange,
}: MetricFilterProps) {
  return (
    <div className="py-3">
      <p className="font-outfit mb-2.5 flex items-center gap-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
        <Icon className="h-3 w-3" />
        {label}
      </p>
      <RangeSlider
        min={min}
        max={max}
        step={step}
        value={value}
        colorPalette={colorPalette}
        onValueChange={(v) => onChange([v[0], v[1]])}
      />
      <div className="mt-1.5 flex justify-between px-0.5 text-[10px] font-medium text-gray-400">
        <span>{value[0]}</span>
        <span>{value[1]}</span>
      </div>
    </div>
  );
}

/** 로스팅 단계 정의 상수 */
export const ROASTING_STAGES = [
  {
    id: 'LIGHT',
    ko: '라이트',
    en: 'Light',
    color: '#D4A373',
    tooltip: '라이트 로스팅 (Soft Blonde/Tan)',
  },
  {
    id: 'MEDIUMLIGHT',
    ko: '미디엄 라이트',
    en: 'Medium Light',
    color: '#A98467',
    tooltip: '미디엄 라이트 (Warm Amber)',
  },
  {
    id: 'MEDIUM',
    ko: '미디엄',
    en: 'Medium',
    color: '#8C5E3C',
    tooltip: '미디엄 로스팅 (Classic Brown)',
  },
  {
    id: 'MEDIUMDARK',
    ko: '미디엄 다크',
    en: 'Medium Dark',
    color: '#6F4E37',
    tooltip: '미디엄 다크 (Rich Espresso)',
  },
  {
    id: 'DARK',
    ko: '다크',
    en: 'Dark',
    color: '#3F2305',
    tooltip: '다크 로스팅 (Deep Dark Chocolate)',
  },
] as const;

/**
 * 로스팅 필터 (5가지 단계 버튼 선택)
 */
interface RoastingFilterProps {
  value: string | null; // LIGHT | MEDIUMLIGHT | MEDIUM | MEDIUMDARK | DARK | null (null 이면 all)
  onChange: (value: string | null) => void;
}

export function RoastingFilter({ value, onChange }: RoastingFilterProps) {
  return (
    <div className="py-3">
      <p className="font-outfit mb-2.5 flex items-center gap-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
        <Flame className="h-3 w-3" />
        로스팅
      </p>
      <div className="flex items-center gap-2">
        {/* 5가지 단계 버튼 */}
        {ROASTING_STAGES.map((stage) => {
          const active = value === stage.id;
          return (
            <Tooltip key={stage.id} content={stage.tooltip}>
              <motion.button
                type="button"
                aria-pressed={active}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onChange(active ? null : stage.id)}
                style={{ backgroundColor: stage.color }}
                className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                  active
                    ? 'scale-105 border-white ring-2 ring-amber-500 ring-offset-2'
                    : 'border-transparent hover:border-gray-300'
                }`}
                aria-label={stage.ko}
              />
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 필터 적용 여부 확인 유틸리티
 */
export const isFiltered = (filters: ProductFilterState) =>
  filters.flavors.length > 0 ||
  filters.flavor.balance[0] !== 1 ||
  filters.flavor.balance[1] !== 5 ||
  filters.flavor.sweetness[0] !== 1 ||
  filters.flavor.sweetness[1] !== 5 ||
  filters.flavor.acidity[0] !== 1 ||
  filters.flavor.acidity[1] !== 5 ||
  filters.body[0] !== 1 ||
  filters.body[1] !== 5 ||
  filters.roasting !== null;
