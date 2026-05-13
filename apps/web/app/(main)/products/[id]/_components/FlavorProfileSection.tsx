'use client';

import { RatingScale, type ColorPalette } from '@coffee-service/ui-library';
import { motion } from 'framer-motion';
import { Droplets, Flame, Layers, Scale, Sparkles } from 'lucide-react';

import SectionContainer from '@/components/layout/SectionContainer';
import { cn } from '@/lib/utils';

interface FlavorProfileProps {
  balance: number | null;
  sweetness: number | null;
  acidity: number | null;
  body: number | null;
  roastingType: string;
}

function ProfileIndicator({
  label,
  value,
  max = 5,
  colorPalette = 'amber',
}: {
  label: string;
  value: number | null;
  max?: number;
  colorPalette?: ColorPalette;
}) {
  const ICONS: Record<string, typeof Droplets> = {
    산미: Droplets,
    감미: Sparkles,
    바디감: Layers,
    밸런스: Scale,
  };
  const Icon = ICONS[label] || Sparkles;

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-gray-400" />
          <span className="font-outfit text-sm font-semibold tracking-wider text-gray-900 uppercase">
            {label}
          </span>
        </div>
        <span className="font-outfit text-xs font-medium text-gray-500">
          {value !== null ? `${value} / ${max}` : 'N/A'}
        </span>
      </div>
      <RatingScale
        max={max}
        value={value || 0}
        readOnly
        variant="indicator"
        colorPalette={value !== null ? colorPalette : 'stone'}
        className={cn('w-full', value === null && 'opacity-30')}
      />
    </div>
  );
}

export function FlavorProfileSection({
  balance,
  sweetness,
  acidity,
  body,
  roastingType,
}: FlavorProfileProps) {
  const ROAST_MAP: Record<string, string> = {
    LIGHT: 'Light',
    LIGHTMEDIUM: 'Light-Medium',
    MEDIUM: 'Medium',
    MEDIUMDARK: 'Medium-Dark',
    DARK: 'Dark',
  };

  const formattedRoast = ROAST_MAP[roastingType] || roastingType || 'N/A';

  return (
    <SectionContainer className="border-t border-gray-100 py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-playfair text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-gray-900">
              Flavor Profile
            </h2>
            <p className="mt-2 text-[clamp(0.875rem,2vw,1.125rem)] text-gray-500">
              원두가 가진 고유의 향미 특성
            </p>
          </div>
          <div className="flex h-fit items-center gap-2 rounded-full bg-stone-100 px-4 py-1.5">
            <Flame className="h-4 w-4 text-stone-600" />
            <span className="font-outfit text-xs font-bold tracking-widest text-stone-800 uppercase">
              Roast: {formattedRoast}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-16 gap-y-12 md:grid-cols-2 lg:grid-cols-2">
          <ProfileIndicator label="산미" value={acidity} colorPalette="teal" />
          <ProfileIndicator label="감미" value={sweetness} colorPalette="amber" />
          <ProfileIndicator label="바디감" value={body} colorPalette="espresso" />
          <ProfileIndicator
            label="밸런스"
            value={balance}
            colorPalette={
              balance === null ? 'stone' : balance <= 2 ? 'amber' : balance === 3 ? 'teal' : 'amber'
            }
          />
        </div>
      </motion.div>
    </SectionContainer>
  );
}
