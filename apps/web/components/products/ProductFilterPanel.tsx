'use client';

import { motion } from 'framer-motion';
import { Droplets, Flame, Layers, RotateCcw, Scale, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DEFAULT_FILTERS, type FlavorType, type ProductFilterState } from '@/lib/api/products';

import { FlavorFilter, MetricFilter, isFiltered } from './filters/FilterSections';
import ProductSearchBar from './ProductSearchBar';

interface ProductFilterPanelProps {
  filters: ProductFilterState;
  onChange: (filters: ProductFilterState) => void;
  onReset: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
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
      <div className="scrollbar-hide flex-1 overflow-x-visible overflow-y-auto px-4 pb-4">
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
        <div className="border-b border-gray-100 pb-4">
          <FlavorFilter selectedFlavors={localFilters.flavors} onToggle={toggleFlavor} />
        </div>

        {/* Metrics Section */}
        <div className="space-y-1 py-3">
          <MetricFilter
            label="Acidity"
            icon={Droplets}
            value={localFilters.flavor.acidity}
            onChange={(v) =>
              setLocalFilters({
                ...localFilters,
                flavor: { ...localFilters.flavor, acidity: v },
              })
            }
          />

          <MetricFilter
            label="Sweetness"
            icon={Sparkles}
            value={localFilters.flavor.sweetness}
            onChange={(v) =>
              setLocalFilters({
                ...localFilters,
                flavor: { ...localFilters.flavor, sweetness: v },
              })
            }
          />

          <MetricFilter
            label="Body"
            icon={Layers}
            value={localFilters.body}
            onChange={(v) => setLocalFilters({ ...localFilters, body: v })}
          />

          <MetricFilter
            label="Balance"
            icon={Scale}
            value={localFilters.flavor.balance}
            colorPalette="teal"
            onChange={(v) =>
              setLocalFilters({
                ...localFilters,
                flavor: { ...localFilters.flavor, balance: v },
              })
            }
          />

          <MetricFilter
            label="Roasting"
            icon={Flame}
            value={localFilters.roasting}
            colorPalette="espresso"
            onChange={(v) => setLocalFilters({ ...localFilters, roasting: v })}
          />
        </div>
      </div>

      {/* 스티키 적용 버튼 */}
      <div className="shrink-0 border-t border-gray-100 bg-white pt-4 pb-2">
        <button
          onClick={handleApply}
          className="font-outfit w-full rounded-xl bg-amber-500 py-3.5 text-sm font-semibold text-white transition-all hover:bg-amber-600 hover:shadow-lg active:scale-[0.98]"
        >
          적용하기
        </button>
      </div>
    </aside>
  );
}
