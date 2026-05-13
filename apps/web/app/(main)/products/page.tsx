'use client';

import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';

import { searchProductsAction } from '@/actions/products.action';
import PageContainer from '@/components/layout/PageContainer';
import ProductCardList from '@/components/products/ProductCardList';
import ProductFilterDrawer from '@/components/products/ProductFilterDrawer';
import ProductFilterPanel from '@/components/products/ProductFilterPanel';
import {
  DEFAULT_FILTERS,
  type ProductFilterState,
  decodeParamsToFilters,
  encodeFiltersToParams,
  mapSearchItemToProductInfo,
  mapFiltersToApiRequest,
} from '@/lib/api/products';

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 파라미터를 기반으로 필터, 검색어, 페이지 상태 도출 (Single Source of Truth)
  const { filters, searchQuery } = useMemo(
    () => decodeParamsToFilters(searchParams),
    [searchParams],
  );
  const currentPage = Number(searchParams.get('page')) || 0;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // React Query를 사용한 데이터 페칭
  const { data: searchResult, isLoading } = useQuery({
    queryKey: ['products', filters, searchQuery, currentPage],
    queryFn: async () => {
      const req = mapFiltersToApiRequest(filters, searchQuery, currentPage);
      const result = await searchProductsAction(req);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch products');
      }
      if (!result.data) {
        throw new Error('No data received from server');
      }
      return result.data;
    },
  });

  const products = useMemo(() => {
    if (!searchResult?.content) return [];
    return searchResult.content.map(mapSearchItemToProductInfo);
  }, [searchResult]);

  /** URL 쿼리 스트링 업데이트 공통 함수 */
  const updateUrl = (
    newFilters: ProductFilterState,
    newSearch: string,
    newPage: number = 0,
    options: { replace?: boolean } = { replace: false },
  ) => {
    const params = encodeFiltersToParams(newFilters, newSearch);
    if (newPage > 0) {
      params.set('page', newPage.toString());
    }
    const queryString = params.toString();
    const url = `/products${queryString ? '?' + queryString : ''}`;

    if (options.replace) {
      router.replace(url, { scroll: false });
    } else {
      router.push(url, { scroll: false });
    }
  };

  const handleFilterChange = (newFilters: ProductFilterState) => {
    updateUrl(newFilters, searchQuery, 0, { replace: true });
  };

  const handleSearchChange = (newSearch: string) => {
    updateUrl(filters, newSearch, 0, { replace: true });
  };

  const handleReset = () => {
    updateUrl(DEFAULT_FILTERS, '', 0, { replace: false });
  };

  const handlePageChange = (page: number) => {
    updateUrl(filters, searchQuery, page, { replace: false });
    // 스크롤 맨 위로 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                  {searchResult?.totalElements || 0}개의 상품
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

            <ProductCardList
              products={products}
              isLoading={isLoading}
              pageInfo={
                searchResult
                  ? {
                      currentPage: searchResult.currentPage,
                      size: searchResult.size,
                      totalElements: searchResult.totalElements,
                      totalPages: searchResult.totalPages,
                      hasNext: searchResult.hasNext,
                      hasPrevious: searchResult.hasPrevious,
                    }
                  : undefined
              }
              onPageChange={handlePageChange}
            />
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
