'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import ProductCard from '@/components/common/cards/ProductCard';
import SectionContainer from '@/components/layout/SectionContainer';
import { RecommendedProduct } from '@/lib/api/main';

interface RecommendedProductsProps {
  products: RecommendedProduct[];
}

export default function RecommendedProducts({ products }: RecommendedProductsProps) {
  return (
    <SectionContainer id="recommended" className="bg-gray-50 py-12 md:py-20">
      <div className="mb-12 flex flex-col items-start justify-between sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            오늘의 추천 원두
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            전문가들이 매일 새롭게 엄선한, 지금 가장 맛있는 커피
          </p>
        </div>
        <Link
          href="/products"
          className="text-primary group mt-4 flex items-center text-sm font-semibold transition-colors hover:text-black sm:mt-0"
        >
          전체 보기
          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
        {products.map((product, idx) => (
          <div key={product.id} className={idx >= 4 ? 'hidden' : ''}>
            <ProductCard {...product} index={idx} />
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
