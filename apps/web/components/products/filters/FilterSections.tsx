'use client';

import { RangeSlider, Tooltip } from '@coffee-service/ui-library';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
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
      <p className={SECTION_TITLE}>Flavor</p>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-8">
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
  filters.roasting[0] !== 1 ||
  filters.roasting[1] !== 5;
