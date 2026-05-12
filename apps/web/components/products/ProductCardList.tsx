'use client';

import { AnimatePresence } from 'framer-motion';

import ProductCard from '@/components/common/cards/ProductCard';
import { type ProductInfo } from '@/lib/api/products';

interface ProductCardListProps {
  products: ProductInfo[];
  isLoading: boolean;
}

function SkeletonCard() {
  return <div className="aspect-[3/4] animate-pulse rounded-2xl bg-gray-100" />;
}

export default function ProductCardList({ products, isLoading }: ProductCardListProps) {
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
        <p className="font-outfit text-sm font-medium text-gray-400">조건에 맞는 원두가 없습니다</p>
        <p className="font-outfit mt-1 text-xs text-gray-300">필터를 조정해보세요</p>
      </div>
    );
  }

  return (
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
  );
}
