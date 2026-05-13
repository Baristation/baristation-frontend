'use client';

import { AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import ProductCard from '@/components/common/cards/ProductCard';
import { type ProductInfo, type PageInfo } from '@/lib/api/products';

interface ProductCardListProps {
  products: ProductInfo[];
  isLoading: boolean;
  pageInfo?: PageInfo;
  onPageChange?: (page: number) => void;
}

function SkeletonCard() {
  return <div className="aspect-[3/4] animate-pulse rounded-2xl bg-gray-100" />;
}

export default function ProductCardList({
  products,
  isLoading,
  pageInfo,
  onPageChange,
}: ProductCardListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center py-24 text-center">
        <p className="font-outfit text-sm font-medium text-gray-400">조건에 맞는 상품이 없습니다</p>
        <p className="font-outfit mt-1 text-xs text-gray-300">필터를 조정해보세요</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div
        className="grid w-full grid-cols-2 items-start gap-4 md:grid-cols-3 lg:grid-cols-4"
        key={`${products.length}-${products[0]?.id}`}
      >
        <AnimatePresence>
          {products.map((product, i) => (
            <ProductCard key={product.id} {...product} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
      {pageInfo && pageInfo.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <button
            onClick={() => onPageChange?.(pageInfo.currentPage - 1)}
            disabled={!pageInfo.hasPrevious}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="font-outfit text-sm font-medium text-gray-700">
            {pageInfo.currentPage + 1} / {pageInfo.totalPages}
          </span>

          <button
            onClick={() => onPageChange?.(pageInfo.currentPage + 1)}
            disabled={!pageInfo.hasNext}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
