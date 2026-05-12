import { RatingScale } from '@coffee-service/ui-library';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { Droplets, Flame, Layers, RotateCcw, Scale, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  FLAVOR_TYPES,
  type FlavorType,
  DEFAULT_FILTERS,
  type ProductFilterState,
} from '@/lib/api/products';

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

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      aria-pressed={active}
      className={`cursor-pointer rounded-full px-3 py-1.5 text-xs transition-all ${
        active
          ? 'bg-amber-500 font-semibold text-white shadow-sm'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </motion.button>
  );
}

const SECTION_TITLE =
  'font-outfit mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400';

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
              <div className="border-t border-gray-100 py-5">
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

              {/* Metric Sections (Ungrouped) */}
              <div className="space-y-1">
                {/* Acidity */}
                <div className="border-t border-gray-100 py-2.5">
                  <p className="font-outfit mb-1.5 flex items-center gap-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                    <Droplets className="h-3 w-3" />
                    Acidity
                  </p>
                  <RatingScale
                    variant="sm"
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
                <div className="border-t border-gray-100 py-2.5">
                  <p className="font-outfit mb-1.5 flex items-center gap-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                    <Sparkles className="h-3 w-3" />
                    Sweetness
                  </p>
                  <RatingScale
                    variant="sm"
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
                <div className="border-t border-gray-100 py-2.5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="font-outfit flex items-center gap-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                      <Layers className="h-3 w-3" />
                      Body
                    </p>
                    <span className="text-xs text-gray-400">
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
                    </span>
                  </div>
                  <RatingScale
                    variant="sm"
                    max={5}
                    value={localFilters.body}
                    onChange={(v) =>
                      setLocalFilters({ ...localFilters, body: v as ProductFilterState['body'] })
                    }
                  />
                </div>

                {/* Balance */}
                <div className="border-t border-gray-100 py-2.5">
                  <p className="font-outfit mb-1.5 flex items-center gap-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                    <Scale className="h-3 w-3" />
                    Balance
                  </p>
                  <RatingScale
                    variant="sm"
                    max={5}
                    value={localFilters.flavor.balance}
                    colorPalette={
                      localFilters.flavor.balance <= 2
                        ? 'red'
                        : localFilters.flavor.balance === 3
                          ? 'blue'
                          : 'green'
                    }
                    onChange={(v) =>
                      setLocalFilters({
                        ...localFilters,
                        flavor: { ...localFilters.flavor, balance: v },
                      })
                    }
                  />
                </div>

                {/* Roasting */}
                <div className="border-t border-gray-100 py-2.5 pb-2.5">
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="font-outfit flex items-center gap-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                      <Flame className="h-3 w-3" />
                      Roasting
                    </p>
                    <span className="text-xs text-gray-400">
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
                    </span>
                  </div>
                  <RatingScale
                    variant="sm"
                    max={5}
                    value={localFilters.roasting}
                    colorPalette="espresso"
                    onChange={(v) =>
                      setLocalFilters({
                        ...localFilters,
                        roasting: v as ProductFilterState['roasting'],
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
                  className="font-outfit flex-[2] rounded-2xl bg-amber-500 py-4 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-amber-600 active:scale-[0.98]"
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
