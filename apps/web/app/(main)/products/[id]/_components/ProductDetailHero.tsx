'use client';

import { Button } from '@coffee-service/ui-library';
import { motion } from 'framer-motion';
import { Bookmark, Share, ChevronLeft, ExternalLink, Globe } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import SectionContainer from '@/components/layout/SectionContainer';
import type {
  BeanSummaryDTO,
  RoasterDTO,
  ProductImageDTO,
  FlavorNoteDTO,
} from '@/lib/api/products';
import { cn } from '@/lib/utils';

interface ProductDetailHeroProps {
  beanSummary: BeanSummaryDTO;
  roaster: RoasterDTO;
  agtronMin: number | null;
  agtronMax: number | null;
  additionalImages: ProductImageDTO[];
  flavorNotes: FlavorNoteDTO[];
}

export function ProductDetailHero({
  beanSummary,
  roaster,
  agtronMin,
  agtronMax,
  additionalImages,
  flavorNotes,
}: ProductDetailHeroProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Filter out any potential null/undefined images
  const allImages = [beanSummary.productImage, ...additionalImages].filter(
    Boolean,
  ) as ProductImageDTO[];
  const DEFAULT_IMAGE = '/images/default-product.png';
  const currentImage = allImages[currentImageIndex];

  const getSanitizedUrl = (url: string | null) => {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return url;
      }
      return null;
    } catch {
      return null;
    }
  };

  const sanitizedUrl = getSanitizedUrl(roaster.homepageUrl);

  const handlePurchaseClick = () => {
    if (!sanitizedUrl) {
      alert('구매처 링크가 유효하지 않거나 준비 중입니다.');
      return;
    }
    window.open(sanitizedUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <SectionContainer className="relative mt-0 pt-4 pb-6 md:mt-4 md:py-8">
      {/* Mobile Top Header */}
      <div className="mb-6 flex items-center justify-between md:hidden">
        <Link href="/" className="font-playfair text-2xl font-bold tracking-tighter text-gray-900">
          Baristation
        </Link>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsBookmarked(!isBookmarked)}
            aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
            title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
            className="h-10 w-10 border-gray-100 bg-white/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
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
            aria-label="Share product"
            title="Share product"
            className="h-10 w-10 border-gray-100 bg-white/90 text-gray-300 shadow-sm backdrop-blur-sm"
            disabled
          >
            <Share className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Back Button */}
      <Link
        href="/products"
        className="group mb-4 flex w-fit items-center space-x-2 text-gray-500 transition-colors hover:text-gray-900"
      >
        <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
        <span className="font-outfit text-sm font-medium tracking-wider uppercase">Back</span>
      </Link>

      <div className="relative grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-12 lg:gap-20">
        {/* Left: Image Container */}
        <div className="flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-50"
          >
            <Image
              src={currentImage?.imageUrl || DEFAULT_IMAGE}
              alt={beanSummary.beanNameKo}
              fill
              className="object-cover transition-transform duration-700"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </motion.div>

          {/* Thumbnail Strip */}
          {allImages.length > 1 && (
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={img.productImageId || idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={cn(
                    'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                    currentImageIndex === idx
                      ? 'border-amber-500'
                      : 'border-transparent opacity-60 hover:opacity-100',
                  )}
                >
                  <Image
                    src={img.imageUrl || DEFAULT_IMAGE}
                    alt={`Thumbnail ${idx}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className="flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Header Info */}
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="font-outfit text-xs font-semibold tracking-widest text-amber-600 uppercase">
                  {roaster.nameKo}
                </span>
                {sanitizedUrl && (
                  <Link
                    href={sanitizedUrl}
                    target="_blank"
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Visit roaster website"
                  >
                    <Globe className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
              <h1 className="font-playfair mb-3 text-[clamp(2rem,5vw,3.5rem)] leading-tight font-bold text-gray-900">
                {beanSummary.beanNameKo}
              </h1>
              <p className="font-outfit text-sm font-medium tracking-[0.2em] text-gray-400 uppercase">
                {beanSummary.origin} · {beanSummary.region}
              </p>
            </div>

            {/* Flavor Notes Grid */}
            {flavorNotes.length > 0 && (
              <div className="mb-8 flex flex-wrap gap-4">
                {flavorNotes.map((note) => (
                  <div
                    key={note.flavorNoteId}
                    className="flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5"
                  >
                    <span className="text-xs font-semibold text-orange-900">{note.nameKo}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Agtron Section */}
            {agtronMin !== null && (
              <div className="mb-10 rounded-2xl border border-gray-100 bg-gray-50/50 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-outfit text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Agtron Degree
                  </span>
                  <span className="font-outfit text-xs font-bold text-gray-900">
                    {agtronMin} {agtronMax !== null && `- ${agtronMax}`}
                  </span>
                </div>
                <div className="relative h-2 w-full rounded-full bg-linear-to-r from-[#D9BBA9] via-[#8B5A2B] to-[#3D2B1F]">
                  <div
                    className="absolute -top-1 h-4 w-4 rounded-full border-2 border-white bg-amber-500 shadow-sm transition-all"
                    style={{ left: `${(agtronMin / 100) * 100}%` }}
                  />
                  {agtronMax !== null && (
                    <div
                      className="absolute -top-1 h-4 w-4 rounded-full border-2 border-white bg-amber-500 shadow-sm transition-all"
                      style={{ left: `${(agtronMax / 100) * 100}%` }}
                    />
                  )}
                </div>
                <div className="mt-4 flex justify-between text-[10px] font-medium text-gray-400 uppercase">
                  <span>Light</span>
                  <span>Medium</span>
                  <span>Dark</span>
                </div>
              </div>
            )}

            {/* Roaster Description */}
            <div className="mb-10">
              <p className="text-sm leading-relaxed text-gray-600">{roaster.description}</p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-8">
              <Button
                variant="default"
                size="lg"
                onClick={handlePurchaseClick}
                className="rounded-full bg-gray-900 px-8 text-white hover:bg-gray-800"
              >
                <span className="font-outfit text-sm font-semibold tracking-wider">구매하기</span>
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                  title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                  className={cn(
                    'h-12 w-12 rounded-full border-gray-200 transition-all',
                    isBookmarked ? 'border-amber-200 bg-amber-50' : 'hover:bg-gray-50',
                  )}
                >
                  <Bookmark
                    className={cn(
                      'h-5 w-5 transition-colors',
                      isBookmarked ? 'fill-amber-500 text-amber-500' : 'text-gray-400',
                    )}
                  />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Share product"
                  title="Share product"
                  className="h-12 w-12 rounded-full border-gray-200 opacity-40"
                  disabled
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
