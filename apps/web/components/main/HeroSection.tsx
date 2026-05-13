'use client';

import { Skeleton } from '@coffee-service/ui-library';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { MapPin, Coffee } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';

// 캐러셀 슬라이드 타입
export interface CarouselSlide {
  id: number;
  imageUrl: string;
  alt: string;
}

interface HeroSectionProps {
  carouselImages?: CarouselSlide[];
}

// Add some nice premium coffee background images (Using unspash placeholders for aesthetics)
const DEFAULT_SLIDES: CarouselSlide[] = [
  {
    id: 1,
    imageUrl:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2670&auto=format&fit=crop',
    alt: 'Coffee pour over',
  },
  {
    id: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=2574&auto=format&fit=crop',
    alt: 'Espresso machine',
  },
  {
    id: 3,
    imageUrl:
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=2561&auto=format&fit=crop',
    alt: 'Coffee products',
  },
];

export default function HeroSection({ carouselImages }: HeroSectionProps = {}) {
  const SLIDES = carouselImages ?? DEFAULT_SLIDES;
  const { user, isAuthenticated, isLoading } = useAuth();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Next/prev button functions optional since we can swipe, but we can do auto scroll
  useEffect(() => {
    if (!emblaApi) return;

    // Respect user's reduced motion preference (A11y)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(autoplay);
  }, [emblaApi]);

  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden bg-black">
      {/* Carousel */}
      <div className="h-full w-full" ref={emblaRef}>
        <div className="flex h-full w-full touch-pan-y">
          {SLIDES.map((slide, index) => (
            <div key={slide.id} className="relative h-full w-full flex-none transform-gpu">
              <Image
                src={slide.imageUrl}
                alt={slide.alt}
                fill
                priority={index === 0}
                className="object-cover opacity-60"
                sizes="100vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Overlay Content */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-linear-to-t from-black/80 via-black/30 to-black/10 select-none">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
            className="pointer-events-auto max-w-2xl text-white select-none"
          >
            <h1 className="mb-4 flex flex-col leading-tight font-extrabold tracking-tight">
              <span className="text-4xl sm:text-5xl md:text-6xl">
                {isLoading ? (
                  <Skeleton className="h-10 w-48 sm:h-12 sm:w-64 md:h-16 md:w-80" />
                ) : isAuthenticated ? (
                  <>
                    안녕하세요, <span className="text-yellow-500">{user?.name}</span>님.
                  </>
                ) : (
                  '안녕하세요, 커피 모험가님.'
                )}
              </span>
              <span className="mt-2 block text-[26px] text-white sm:text-4xl sm:whitespace-nowrap md:text-5xl md:leading-[1.15]">
                오늘은 어떤 한 잔을 내려볼까요?
              </span>
            </h1>
            {isLoading ? (
              <div className="mb-8 space-y-2">
                <Skeleton className="h-5 w-full max-w-[400px]" />
                <Skeleton className="h-5 w-2/3 max-w-[280px]" />
              </div>
            ) : (
              <p className="mb-8 text-lg break-keep text-gray-300 md:text-xl">
                {isAuthenticated
                  ? '당신만을 위한 완벽한 커피 큐레이션을 준비했습니다. 지금 바로 확인해보세요.'
                  : '당신만의 완벽한 커피를 찾아보세요. 스페셜티 원두 큐레이션부터 우리 동네 숨겨진 로스터리까지.'}
              </p>
            )}

            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Link
                href="#recommended"
                className="group flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-bold text-black transition-all hover:scale-105 hover:bg-gray-100 active:scale-95"
              >
                <Coffee className="mr-2 h-5 w-5 transition-transform group-hover:-rotate-12" />
                원두 탐색
              </Link>
              <Link
                href="#classes"
                className="group flex items-center justify-center rounded-full border border-white/30 bg-black/20 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:scale-105 hover:border-white/50 hover:bg-white/10 active:scale-95"
              >
                <MapPin className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                근처 클래스
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 space-x-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === selectedIndex ? 'w-8 bg-white' : 'w-2 bg-white/40'
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
