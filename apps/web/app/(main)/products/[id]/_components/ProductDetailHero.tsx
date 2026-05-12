'use client';

import { Button } from '@coffee-service/ui-library';
import { motion } from 'framer-motion';
import { Bookmark, Share, ChevronLeft, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import SectionContainer from '@/components/layout/SectionContainer';
import { FLAVOR_BG_CLASS } from '@/lib/api/products';
import type { FlavorType } from '@/lib/api/products';
import { cn } from '@/lib/utils';

interface ProductDetailHeroProps {
  name: string;
  origin: string;
  roastery?: string;
  flavorImageUrl: string;
  primaryFlavor: FlavorType;
  purchaseUrl?: string;
}

export function ProductDetailHero({
  name,
  origin,
  roastery,
  flavorImageUrl,
  primaryFlavor,
  purchaseUrl,
}: ProductDetailHeroProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const bgClass = FLAVOR_BG_CLASS[primaryFlavor] ?? 'bg-gray-100';

  const handlePurchaseClick = () => {
    if (!purchaseUrl) {
      alert('구매처 링크를 준비 중입니다.');
      return;
    }

    try {
      const url = new URL(purchaseUrl);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        window.open(purchaseUrl, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('Invalid protocol');
      }
    } catch (error) {
      console.error('Safe URL validation failed:', error);
      alert('구매처 링크를 준비 중입니다.');
    }
  };

  return (
    <SectionContainer className="relative mt-0 pt-4 pb-6 md:mt-4 md:py-8">
      {/* Mobile Top Header: Logo + Actions (Matches list page pattern) */}
      <div className="mb-6 flex items-center justify-between md:hidden">
        <Link href="/" className="font-playfair text-2xl font-bold tracking-tighter text-gray-900">
          Baristation
        </Link>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="h-10 w-10 border-gray-100 bg-white/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
            aria-label={isBookmarked ? '북마크 취소' : '북마크 추가'}
            aria-pressed={isBookmarked}
          >
            <Bookmark
              className={cn(
                'h-5 w-5 transition-colors',
                isBookmarked ? 'fill-gray-700 text-gray-700' : 'text-gray-400',
              )}
            />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 border-gray-100 bg-white/90 text-gray-300 shadow-sm backdrop-blur-sm"
            disabled
            aria-disabled="true"
            aria-label="공유하기 (준비 중)"
          >
            <Share className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Floating Purchase Button for Mobile */}
      <div className="bottom-mobile-fab fixed right-2 z-50 md:hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Button
            onClick={handlePurchaseClick}
            className="h-12 w-12 rounded-full bg-gray-900 text-white shadow-2xl transition-transform active:scale-95"
            aria-label="구매하기"
          >
            <ExternalLink className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>

      {/* Back Button */}
      <Link
        href="/products"
        className="group mb-4 flex w-fit items-center space-x-2 text-gray-500 transition-colors hover:text-gray-900"
        aria-label="원두 목록으로 돌아가기"
      >
        <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
        <span className="font-outfit text-sm font-medium tracking-wider uppercase">Back</span>
      </Link>

      <div className="relative grid grid-cols-1 items-start gap-4 md:grid-cols-2 md:gap-12 lg:gap-20">
        {/* Left: Image Container + Mobile Text Overlay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn(
            'relative mx-auto aspect-square w-full max-w-[600px] overflow-hidden rounded-2xl',
            bgClass,
          )}
        >
          <Image
            src={flavorImageUrl}
            alt={`${primaryFlavor} 향미의 ${name} 대표 이미지`}
            fill
            className="object-cover transition-transform duration-1000 hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          {/* Mobile Overlay Gradient for readability */}
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent md:hidden" />

          {/* Mobile-only Text Overlay */}
          <div className="absolute bottom-0 left-0 z-10 w-full p-6 md:hidden">
            {roastery && (
              <p className="font-outfit mb-2 text-xs font-medium tracking-[0.2em] text-white/80 uppercase">
                {roastery}
              </p>
            )}
            <h1 className="font-playfair mb-2 text-3xl font-bold text-white">{name}</h1>
            <p className="font-outfit text-xs font-medium tracking-[0.2em] text-white/60 uppercase">
              {origin}
            </p>
          </div>
        </motion.div>

        {/* Right: Info & Actions */}
        <div className="flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          >
            {/* Tablet/Desktop Text Content */}
            <div className="hidden md:block">
              {roastery && (
                <p className="font-outfit mb-3 text-sm font-medium tracking-[0.2em] text-amber-600 uppercase">
                  {roastery}
                </p>
              )}
              <h1 className="font-playfair mb-4 text-[clamp(1.75rem,5vw,3.75rem)] leading-tight font-bold text-gray-900">
                {name}
              </h1>
              <p className="font-outfit mb-8 text-sm font-medium tracking-[0.2em] text-gray-500 uppercase">
                {origin}
              </p>
            </div>

            {/* Action Bar (Only visible on md+) */}
            <div className="hidden items-center justify-between pt-4 md:flex md:border-t md:border-gray-100 md:pt-8">
              <Button
                variant="default"
                size="lg"
                onClick={handlePurchaseClick}
                className="rounded-full bg-gray-900 text-white hover:bg-gray-800"
              >
                <span className="font-outfit text-sm font-semibold tracking-wider">구매하기</span>
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className="group h-12 w-12 border-gray-200 transition-colors hover:border-gray-700 hover:bg-gray-50"
                  aria-label={isBookmarked ? '북마크 취소' : '북마크 추가'}
                  aria-pressed={isBookmarked}
                >
                  <Bookmark
                    className={cn(
                      'h-5 w-5 transition-colors',
                      isBookmarked
                        ? 'fill-gray-700 text-gray-700'
                        : 'text-gray-400 group-hover:text-gray-700',
                    )}
                  />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-12 w-12 bg-gray-100 text-gray-400"
                  disabled
                  aria-disabled="true"
                  aria-label="공유하기 (준비 중)"
                >
                  <Share className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionContainer>
  );
}
