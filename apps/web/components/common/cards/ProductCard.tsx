'use client';

import { VisualCard } from '@coffee-service/ui-library';
import { Coffee } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { FLAVOR_BG_CLASS, type ProductInfo } from '@/lib/api/products';

interface ProductCardProps
  extends Pick<ProductInfo, 'id' | 'name' | 'origin' | 'primaryFlavor' | 'flavorImageUrl'> {
  index?: number;
}

/**
 * ProductCard - 원두 상품 이미지 카드 (VisualCard Compound Pattern 적용)
 * 디자인 고도화: 호버 시 원두 프로필(맛, 바디, 로스팅) 정보를 오버레이로 표시
 */
export default function ProductCard({
  id,
  name,
  origin,
  primaryFlavor,
  flavorImageUrl,
}: ProductCardProps) {
  const bgClass = FLAVOR_BG_CLASS[primaryFlavor] ?? 'bg-gray-100';

  return (
    <VisualCard.Root
      asChild
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1], // Quintic Out - very smooth & premium feel
      }}
      hoverEffect="translate"
      className={bgClass}
    >
      <Link href={`/products/${id}`} aria-label={`${name} 원두 상세 정보 보기`}>
        <VisualCard.ImageContainer aspectRatio="3/4">
          <VisualCard.Image asChild hoverScale={1.1}>
            <Image
              src={flavorImageUrl}
              alt={`${primaryFlavor} 향미의 ${name} 원두 이미지`}
              fill
              className="object-cover transition-transform duration-700"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </VisualCard.Image>

          {/* 호버 및 포커스 시 나타나는 프로필 정보 오버레이 (접근성: group-focus-within 추가) */}
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 opacity-0 backdrop-blur-[2px] transition-all duration-500 ease-out group-focus-within:opacity-100 group-hover:opacity-100">
            {/* 내부 콘텐츠가 아래에서 위로 부드럽게 올라오는 애니메이션 추가 */}
            <div className="flex translate-y-8 flex-col items-center space-y-2 transition-all duration-500 ease-out group-focus-within:translate-y-0 group-hover:translate-y-0 md:space-y-4">
              {/* 로스터리 마크 (임의의 플레이스홀더) */}
              <div className="flex justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm md:h-10 md:w-10">
                  <Coffee className="h-4 w-4 text-white/80 md:h-5 md:w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* 텍스트 가독성을 위한 기본 그라데이션 오버레이 (비호버 및 비포커스 시) */}
          <VisualCard.Overlay
            variant="bottom"
            className="z-10 transition-opacity duration-300 group-focus-within:opacity-0 group-hover:opacity-0"
          />

          {/* 텍스트 영역 (비호버 및 비포커스 시 노출) */}
          <VisualCard.Content
            position="bottom-left"
            className="z-20 transition-all duration-500 ease-out group-focus-within:-translate-y-2 group-focus-within:opacity-0 group-hover:-translate-y-2 group-hover:opacity-0"
          >
            <p className="font-outfit mb-1 text-[8px] font-medium tracking-[0.2em] text-white/70 uppercase md:mb-2 md:text-[10px]">
              {origin}
            </p>
            <VisualCard.Title className="font-playfair text-lg leading-tight font-bold tracking-tight text-white md:text-2xl">
              {name}
            </VisualCard.Title>
          </VisualCard.Content>
        </VisualCard.ImageContainer>
      </Link>
    </VisualCard.Root>
  );
}
