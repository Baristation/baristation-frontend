'use client';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { Droplets, Layers, RotateCcw, Scale, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DEFAULT_FILTERS, type FlavorType, type ProductFilterState } from '@/lib/api/products';

import { FlavorFilter, MetricFilter, RoastingFilter } from './filters/FilterSections';
import ProductSearchBar from './ProductSearchBar';

interface ProductFilterDrawerProps {
  isOpen: boolean;
  filters: ProductFilterState;
  onChange: (filters: ProductFilterState) => void;
  onReset: () => void;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function ProductFilterDrawer({
  isOpen,
  filters,
  onChange,
  onReset,
  onClose,
  searchQuery,
  onSearchChange,
}: ProductFilterDrawerProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const dragControls = useDragControls();

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // body 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleFlavor = (flavor: FlavorType) => {
    const next = localFilters.flavors.includes(flavor)
      ? localFilters.flavors.filter((a) => a !== flavor)
      : [...localFilters.flavors, flavor];
    setLocalFilters({ ...localFilters, flavors: next });
  };

  const handleApply = () => {
    onChange(localFilters);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 1 }}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (info.offset.y > 150) {
                onClose();
              }
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-drawer-title"
            className="fixed right-0 bottom-0 left-0 z-50 flex h-full flex-col rounded-t-[2.5rem] bg-white md:hidden"
          >
            {/* Handle bar Area (Drag Trigger) */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex cursor-grab touch-none justify-center pt-5 pb-3 select-none active:cursor-grabbing"
            >
              <div className="h-1.5 w-12 rounded-full bg-gray-200" />
            </div>

            {/* Scrollable Content */}
            <div className="scrollbar-hide flex-1 overflow-y-auto px-6 pb-8">
              {/* 헤더 */}
              <div className="flex items-center justify-between py-4">
                <span
                  id="filter-drawer-title"
                  className="font-outfit text-sm font-semibold text-gray-800"
                >
                  Filter
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      onReset();
                      setLocalFilters(DEFAULT_FILTERS);
                    }}
                    className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"
                  >
                    <RotateCcw className="h-3 w-3" />
                    초기화
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="mb-4">
                <ProductSearchBar value={searchQuery} onChange={onSearchChange} />
              </div>

              {/* Flavor */}
              <div className="border-t border-gray-100 py-4">
                <FlavorFilter selectedFlavors={localFilters.flavors} onToggle={toggleFlavor} />
              </div>

              {/* Metric Sections (Ungrouped) */}
              <div className="space-y-0.5">
                <div className="border-t border-gray-100">
                  <MetricFilter
                    label="산미"
                    icon={Droplets}
                    value={localFilters.flavor.acidity}
                    onChange={(v) =>
                      setLocalFilters({
                        ...localFilters,
                        flavor: { ...localFilters.flavor, acidity: v },
                      })
                    }
                  />
                </div>

                <div className="border-t border-gray-100">
                  <MetricFilter
                    label="감미"
                    icon={Sparkles}
                    value={localFilters.flavor.sweetness}
                    onChange={(v) =>
                      setLocalFilters({
                        ...localFilters,
                        flavor: { ...localFilters.flavor, sweetness: v },
                      })
                    }
                  />
                </div>

                <div className="border-t border-gray-100">
                  <MetricFilter
                    label="바디감"
                    icon={Layers}
                    value={localFilters.body}
                    onChange={(v) => setLocalFilters({ ...localFilters, body: v })}
                  />
                </div>

                <div className="border-t border-gray-100">
                  <MetricFilter
                    label="밸런스"
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
                </div>

                <div className="border-t border-gray-100">
                  <RoastingFilter
                    value={localFilters.roasting}
                    onChange={(v) =>
                      setLocalFilters({
                        ...localFilters,
                        roasting: v,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* 고정 적용 버튼 영역 */}
            <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-5 pb-10">
              <div className="flex gap-3">
                <button
                  onClick={handleApply}
                  className="font-outfit flex-[2] rounded-2xl bg-amber-500 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:bg-amber-600 active:scale-[0.98]"
                >
                  적용하기
                </button>
                <button
                  onClick={onClose}
                  className="font-outfit flex-1 rounded-2xl border border-gray-200 bg-gray-50 py-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 active:scale-[0.98]"
                >
                  취소하기
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
