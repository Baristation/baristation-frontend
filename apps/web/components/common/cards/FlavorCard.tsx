'use client';

import { VisualCard } from '@coffee-service/ui-library';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { cn } from '@/lib/utils';

interface FlavorCardProps {
  name: string;
  imageUrl: string;
  link: string;
  index?: number;
  className?: string;
}

/**
 * FlavorCard - 단일 향미 카테고리 이미지 카드 (VisualCard Compound Pattern 적용)
 */
export default function FlavorCard({
  name,
  imageUrl,
  link,
  index = 0,
  className = '',
}: FlavorCardProps) {
  return (
    <VisualCard.Root
      asChild
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: index * 0.05,
        duration: 0.5,
        ease: 'easeOut',
      }}
      className={cn('h-full w-full', className)}
    >
      <Link href={link}>
        <VisualCard.ImageContainer>
          {/* 이미지만 확대 */}
          <VisualCard.Image asChild hoverScale={1.1}>
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </VisualCard.Image>

          {/* Scrim Overlay */}
          <VisualCard.Overlay variant="bottom" />

          {/* 컨텐츠 (텍스트) */}
          <VisualCard.Content position="bottom-left">
            <span className="font-outfit text-lg font-bold text-[#F5E6D3]">{name}</span>
          </VisualCard.Content>
        </VisualCard.ImageContainer>
      </Link>
    </VisualCard.Root>
  );
}
