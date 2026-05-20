'use client';

import { VisualCard } from '@coffee-service/ui-library';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Coffee, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { toggleBookmarkAction } from '@/actions/bookmarks.action';
import { FLAVOR_BG_CLASS, type ProductInfo } from '@/lib/api/products';
import { cn } from '@/lib/utils';

interface ProductCardProps
  extends Pick<
    ProductInfo,
    'id' | 'name' | 'origin' | 'primaryFlavor' | 'flavorImageUrl' | 'isBookmarked'
  > {
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
  isBookmarked,
}: ProductCardProps) {
  const bgClass = FLAVOR_BG_CLASS[primaryFlavor] ?? 'bg-gray-100';
  const queryClient = useQueryClient();

  // 낙관적 업데이트를 위한 로컬 상태 (isBookmarked가 주어질 때만 활성화)
  const [localBookmarked, setLocalBookmarked] = useState(isBookmarked ?? false);

  const { mutate } = useMutation({
    mutationFn: async () => {
      const res = await toggleBookmarkAction(id);
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onMutate: async () => {
      // 낙관적 업데이트: 이전 상태 저장 및 로컬 상태 변경
      const previousState = localBookmarked;
      setLocalBookmarked(!previousState);

      // (선택) 쿼리 캐시를 직접 업데이트할 수도 있지만,
      // ProductCard 자체의 로컬 상태가 우선적으로 UI를 변경하므로 여기서는 간단히 로컬 상태만 업데이트합니다.
      return { previousState };
    },
    onError: (err, variables, context) => {
      // 실패 시 원래 상태로 복구
      if (context) {
        setLocalBookmarked(context.previousState);
      }
      console.error('북마크 토글 실패:', err);
    },
    onSettled: () => {
      // 북마크 목록 무효화하여 최신 데이터 동기화
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    mutate();
  };

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
      <Link
        href={`/products/${id}`}
        aria-label={`${name} 원두 상세 정보 보기`}
        className="group relative block"
      >
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

          {/* 북마크 버튼 (isBookmarked가 undefined가 아닐 때만 노출) */}
          {isBookmarked !== undefined && (
            <button
              onClick={handleBookmarkClick}
              className="absolute top-3 right-3 z-40 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-black/40"
              aria-label={localBookmarked ? '북마크 해제' : '북마크 추가'}
            >
              <Heart
                className={cn(
                  'h-4 w-4 transition-colors',
                  localBookmarked ? 'fill-red-500 text-red-500' : 'fill-transparent text-white',
                )}
              />
            </button>
          )}

          {/* 호버 및 포커스 시 나타나는 프로필 정보 오버레이 (접근성: group-focus-within 추가) */}
          <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 opacity-0 backdrop-blur-[2px] transition-all duration-500 ease-out group-focus-within:opacity-100 group-hover:opacity-100">
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
            className="pointer-events-none z-10 transition-opacity duration-300 group-focus-within:opacity-0 group-hover:opacity-0"
          />

          {/* 텍스트 영역 (비호버 및 비포커스 시 노출) */}
          <VisualCard.Content
            position="bottom-left"
            className="pointer-events-none z-20 transition-all duration-500 ease-out group-focus-within:-translate-y-2 group-focus-within:opacity-0 group-hover:-translate-y-2 group-hover:opacity-0"
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
