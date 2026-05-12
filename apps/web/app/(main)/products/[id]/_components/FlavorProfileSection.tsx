'use client';

import { RatingScale, type ColorPalette } from '@coffee-service/ui-library';
import { motion } from 'framer-motion';
import { Droplets, Flame, Layers, Scale, Sparkles } from 'lucide-react';

import SectionContainer from '@/components/layout/SectionContainer';

interface FlavorProfileProps {
  balance: number;
  sweetness: number;
  acidity: number;
  body: number;
  roasting: number;
}

function ProfileIndicator({
  label,
  value,
  max = 5,
  colorPalette = 'amber',
}: {
  label: string;
  value: number;
  max?: number;
  colorPalette?: ColorPalette;
}) {
  const ICONS: Record<string, typeof Droplets> = {
    산미: Droplets,
    감미: Sparkles,
    바디감: Layers,
    밸런스: Scale,
    로스팅: Flame,
  };
  const Icon = ICONS[label] || Flame;

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
          {value} / {max}
        </span>
      </div>
      <RatingScale
        max={max}
        value={value}
        readOnly
        variant="indicator"
        colorPalette={colorPalette}
        className="w-full"
      />
    </div>
  );
}

export function FlavorProfileSection({
  balance,
  sweetness,
  acidity,
  body,
  roasting,
}: FlavorProfileProps) {
  return (
    <SectionContainer className="py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="mb-12">
          <h2 className="font-playfair text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-gray-900">
            Flavor Profile
          </h2>
          <p className="mt-2 text-[clamp(0.875rem,2vw,1.125rem)] text-gray-500">
            원두가 가진 고유의 향미 특성
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          <ProfileIndicator label="산미" value={acidity} />
          <ProfileIndicator label="감미" value={sweetness} />
          <ProfileIndicator label="바디감" value={body} />
        </div>

        <div className="mt-12 mb-12 h-px w-full bg-gray-100" />

        <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          <ProfileIndicator
            label="밸런스"
            value={balance}
            colorPalette={balance <= 2 ? 'red' : balance === 3 ? 'blue' : 'green'}
          />
          <ProfileIndicator label="로스팅" value={roasting} colorPalette="espresso" />
        </div>
      </motion.div>
    </SectionContainer>
  );
}
