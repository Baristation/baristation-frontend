'use client';

import { SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';

import PageContainer from '@/components/layout/PageContainer';
import ProductCardList from '@/components/products/ProductCardList';
import ProductFilterDrawer from '@/components/products/ProductFilterDrawer';
import ProductFilterPanel from '@/components/products/ProductFilterPanel';
import {
  applyProductFilters,
  DEFAULT_FILTERS,
  type ProductFilterState,
  mockProductsData,
  decodeParamsToFilters,
  encodeFiltersToParams,
} from '@/lib/api/products';

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 파라미터를 기반으로 필터 및 검색어 상태 도출 (Single Source of Truth)
  const { filters, searchQuery } = useMemo(
    () => decodeParamsToFilters(searchParams),
    [searchParams],
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filteredProducts = useMemo(
    () => applyProductFilters(mockProductsData, filters, searchQuery),
    [filters, searchQuery],
  );

  /** URL 쿼리 스트링 업데이트 공통 함수 */
  const updateUrl = (
    newFilters: ProductFilterState,
    newSearch: string,
    options: { replace?: boolean } = { replace: false },
  ) => {
    const params = encodeFiltersToParams(newFilters, newSearch);
    const queryString = params.toString();
    const url = `/products${queryString ? '?' + queryString : ''}`;

    if (options.replace) {
      router.replace(url, { scroll: false });
    } else {
      router.push(url, { scroll: false });
    }
  };

  const handleFilterChange = (newFilters: ProductFilterState) => {
    updateUrl(newFilters, searchQuery, { replace: true });
  };

  const handleSearchChange = (newSearch: string) => {
    updateUrl(filters, newSearch, { replace: true });
  };

  const handleReset = () => {
    updateUrl(DEFAULT_FILTERS, '', { replace: false });
  };

  return (
    <PageContainer>
      {/* ── 본문 ── */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
        <div className="flex w-full items-start gap-8">
          {/* 좌측 필터 패널 (Desktop/Tablet) */}
          <ProductFilterPanel
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
          />

          {/* 우측 카드 목록 */}
          <div className="w-full min-w-0 flex-1">
            {/* 검색 및 필터 정보 영역 */}
            <div className="mb-6 flex items-center justify-between">
              {/* 로고 및 결과 수 */}
              <div className="flex flex-col gap-0.5">
                <Link
                  href="/"
                  className="font-playfair text-2xl font-bold tracking-tighter text-gray-900 md:hidden"
                >
                  Baristation
                </Link>
                <div className="font-outfit shrink-0 text-xs text-gray-400">
                  {filteredProducts.length}개의 원두
                </div>
              </div>

              {/* 모바일 필터 버튼 */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-3 text-xs text-gray-600 transition-colors hover:border-amber-300 hover:text-amber-600 md:hidden"
                aria-label="필터 열기"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>

            <ProductCardList products={filteredProducts} isLoading={false} />
          </div>
        </div>
      </div>

      {/* 모바일 필터 Drawer */}
      <ProductFilterDrawer
        isOpen={isDrawerOpen}
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        onClose={() => setIsDrawerOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />
    </PageContainer>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsPageContent />
    </Suspense>
  );
}
