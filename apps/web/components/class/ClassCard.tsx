'use client';

import { motion } from 'framer-motion';
import { Star, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { LessonSummary } from '@/lib/api/lessons';

const DIFFICULTY_STYLE: Record<string, string> = {
  입문: 'bg-[#F2D49B] text-amber-900', // Caramel
  중급: 'bg-[#E8C5C0] text-rose-900', // Wine
  고급: 'bg-[#D0CEC8] text-gray-800', // Smoky
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return '일정 미정';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(price: number) {
  return '₩ ' + price.toLocaleString('ko-KR');
}

interface ClassCardProps extends LessonSummary {
  index?: number;
}

export function ClassCard({
  lessonId,
  lessonImageUrl,
  title,
  subTitle,
  difficulty,
  lessonCategory,
  hostName,
  hostProfileUrl,
  city,
  place,
  nextDate,
  price,
  index = 0,
}: ClassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <Link href={`/classes/${lessonId}`} className="flex h-full flex-col">
        {/* Top Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          <Image
            src={lessonImageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={index < 4}
          />
          {/* Tags */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            {lessonCategory && (
              <span className="rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-bold text-gray-800 shadow-sm backdrop-blur-sm">
                {lessonCategory}
              </span>
            )}
            <span
              className={`rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wider ${
                DIFFICULTY_STYLE[difficulty] ?? 'bg-gray-200 text-gray-800'
              }`}
            >
              {difficulty}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          {/* Host Info */}
          <div className="mb-3 flex items-center gap-2">
            <div className="relative h-6 w-6 overflow-hidden rounded-full ring-1 ring-gray-100">
              <Image
                src={hostProfileUrl}
                alt={hostName}
                fill
                className="object-cover"
                sizes="24px"
              />
            </div>
            <span className="font-inter text-xs text-gray-500">{hostName}</span>
          </div>

          {/* Title & Subtitle */}
          <h3 className="font-playfair mb-2 line-clamp-2 text-xl leading-tight font-bold text-gray-900">
            {title}
          </h3>
          <p className="font-inter mb-5 line-clamp-2 text-sm leading-relaxed text-gray-500">
            {subTitle}
          </p>

          <div className="mt-auto" />

          {/* Bottom Info Box */}
          <div className="flex flex-col gap-3 rounded-2xl bg-[#F8F9FA] p-4">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span className="font-medium">
                  {city} {place}
                </span>
              </div>
              <div className="flex items-center gap-1 font-medium">
                <Star className="h-3.5 w-3.5 fill-gray-800 text-gray-800" />
                <span>4.9 (128)</span>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="font-outfit text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  Next Date
                </span>
                <span className="font-inter text-xs font-semibold text-gray-800">
                  {formatDate(nextDate)}
                </span>
              </div>
              <span className="font-outfit text-lg font-bold text-gray-900">
                {formatPrice(price)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
