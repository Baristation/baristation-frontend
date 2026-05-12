'use client';

import { RatingScale } from '@coffee-service/ui-library';
import { motion } from 'framer-motion';
import { Droplets, Flame, Layers, RotateCcw, Scale, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  FLAVOR_TYPES,
  type FlavorType,
  DEFAULT_FILTERS,
  type ProductFilterState,
} from '@/lib/api/products';

import ProductSearchBar from './ProductSearchBar';

interface ProductFilterPanelProps {
  filters: ProductFilterState;
  onChange: (filters: ProductFilterState) => void;
  onReset: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const isFiltered = (filters: ProductFilterState) =>
  filters.flavors.length > 0 ||
  filters.flavor.balance > 0 ||
  filters.flavor.sweetness > 0 ||
  filters.flavor.acidity > 0 ||
  filters.body > 0 ||
  filters.roasting > 0;

const SECTION_TITLE =
  'font-outfit mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500';

/** 아로마 Chip */
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      aria-pressed={active}
      className={`cursor-pointer rounded-full px-3 py-1 text-xs transition-all ${
        active
          ? 'bg-amber-500 font-semibold text-white shadow-sm'
          : 'border border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
      }`}
    >
      {label}
    </motion.button>
  );
}

export default function ProductFilterPanel({
  filters,
  onChange,
  onReset,
  searchQuery,
  onSearchChange,
}: ProductFilterPanelProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const filtered = isFiltered(localFilters);

  const toggleFlavor = (flavor: FlavorType) => {
    const next = localFilters.flavors.includes(flavor)
      ? localFilters.flavors.filter((a) => a !== flavor)
      : [...localFilters.flavors, flavor];
    setLocalFilters({ ...localFilters, flavors: next });
  };

  const handleApply = () => {
    onChange(localFilters);
  };

  return (
    <aside className="sticky top-24 hidden h-[calc(100vh-8rem)] w-56 shrink-0 flex-col md:flex">
      <div className="scrollbar-hide flex-1 overflow-y-auto">
        {/* 헤더 */}
        <div className="mb-5 flex items-center justify-between">
          <span className="font-outfit text-sm font-semibold text-gray-800">Filter</span>
          {filtered && (
            <motion.button
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => {
                onReset();
                setLocalFilters(DEFAULT_FILTERS);
              }}
              className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
            >
              <RotateCcw className="h-3 w-3" />
              초기화
            </motion.button>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <ProductSearchBar value={searchQuery} onChange={onSearchChange} />
        </div>

        {/* Flavor */}
        <div className="border-b border-gray-100 pb-5">
          <p className={SECTION_TITLE}>Flavor</p>
          <div className="flex flex-wrap gap-2">
            {FLAVOR_TYPES.map((a) => (
              <Chip
                key={a}
                label={a}
                active={localFilters.flavors.includes(a)}
                onClick={() => toggleFlavor(a)}
              />
            ))}
          </div>
        </div>

        {/* Metrics Section */}
        <div className="space-y-4 py-3">
          {/* Acidity */}
          <div className="border-b border-gray-100 pb-4">
            <p className="font-outfit mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-widest text-gray-500 uppercase">
              <Droplets className="h-3 w-3" />
              Acidity
            </p>
            <RatingScale
              max={5}
              value={localFilters.flavor.acidity}
              onChange={(v) =>
                setLocalFilters({
                  ...localFilters,
                  flavor: { ...localFilters.flavor, acidity: v },
                })
              }
            />
          </div>

          {/* Sweetness */}
          <div className="border-b border-gray-100 pb-4">
            <p className="font-outfit mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-widest text-gray-500 uppercase">
              <Sparkles className="h-3 w-3" />
              Sweetness
            </p>
            <RatingScale
              max={5}
              value={localFilters.flavor.sweetness}
              onChange={(v) =>
                setLocalFilters({
                  ...localFilters,
                  flavor: { ...localFilters.flavor, sweetness: v },
                })
              }
            />
          </div>

          {/* Body */}
          <div className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <p className="font-outfit mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-widest text-gray-500 uppercase">
                <Layers className="h-3 w-3" />
                Body
              </p>
              <p className="text-xs text-gray-400">
                {localFilters.body === 1
                  ? 'Very Light'
                  : localFilters.body === 2
                    ? 'Light'
                    : localFilters.body === 3
                      ? 'Medium'
                      : localFilters.body === 4
                        ? 'Full'
                        : localFilters.body === 5
                          ? 'Extra Bold'
                          : ''}
              </p>
            </div>
            <RatingScale
              max={5}
              value={localFilters.body}
              onChange={(v) =>
                setLocalFilters({ ...localFilters, body: v as ProductFilterState['body'] })
              }
            />
          </div>

          {/* Balance */}
          <div className="border-b border-gray-100 pb-4">
            <p className="font-outfit mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-widest text-gray-500 uppercase">
              <Scale className="h-3 w-3" />
              Balance
            </p>
            <RatingScale
              max={5}
              value={localFilters.flavor.balance}
              colorPalette="teal"
              onChange={(v) =>
                setLocalFilters({
                  ...localFilters,
                  flavor: { ...localFilters.flavor, balance: v },
                })
              }
            />
          </div>

          {/* Roasting */}
          <div className="pb-4">
            <div className="flex items-center justify-between">
              <p className="font-outfit mb-2 flex items-center gap-2 text-[10px] font-semibold tracking-widest text-gray-500 uppercase">
                <Flame className="h-3 w-3" />
                Roasting
              </p>
              <p className="text-xs text-gray-400">
                {localFilters.roasting === 1
                  ? 'Light'
                  : localFilters.roasting === 2
                    ? 'Light Medium'
                    : localFilters.roasting === 3
                      ? 'Medium'
                      : localFilters.roasting === 4
                        ? 'Medium Dark'
                        : localFilters.roasting === 5
                          ? 'Dark'
                          : ''}
              </p>
            </div>
            <RatingScale
              max={5}
              value={localFilters.roasting}
              colorPalette="espresso"
              onChange={(v) =>
                setLocalFilters({ ...localFilters, roasting: v as ProductFilterState['roasting'] })
              }
            />
          </div>
        </div>
      </div>

      {/* 스티키 적용 버튼 */}
      <div className="shrink-0 border-t border-gray-100 bg-white pt-4 pb-2">
        <button
          onClick={handleApply}
          className="font-outfit w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
        >
          적용하기
        </button>
      </div>
    </aside>
  );
}
