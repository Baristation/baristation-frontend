'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useState, useCallback } from 'react';

import type { LessonImage } from '@/lib/mocks/classDetail';

interface LessonImageGalleryProps {
  images: LessonImage[];
}

export function LessonImageGallery({ images }: LessonImageGalleryProps) {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const go = useCallback(
    (dir: number) => {
      setDirection(dir);
      setCurrent((prev) => (prev + dir + sorted.length) % sorted.length);
    },
    [sorted.length],
  );

  if (sorted.length === 0) {
    return (
      <div
        className="w-full overflow-hidden rounded-3xl bg-gray-100"
        style={{ aspectRatio: '16/9' }}
      />
    );
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? '60%' : '-60%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-60%' : '60%', opacity: 0 }),
  };

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[32px] bg-gray-100 shadow-sm">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0"
        >
          <Image
            src={sorted[current].imageUrl}
            alt={`클래스 이미지 ${current + 1}`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlay Navigation */}
      {sorted.length > 1 && (
        <>
          <div className="absolute inset-0 flex items-center justify-between p-4">
            <button
              onClick={() => go(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 text-gray-800 backdrop-blur-md transition-transform hover:scale-105 hover:bg-white/80 active:scale-95"
              aria-label="이전 이미지"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => go(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/50 text-gray-800 backdrop-blur-md transition-transform hover:scale-105 hover:bg-white/80 active:scale-95"
              aria-label="다음 이미지"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {sorted.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > current ? 1 : -1);
                  setCurrent(i);
                }}
                className={`h-2 rounded-full transition-all ${
                  i === current ? 'w-6 bg-white' : 'w-2 bg-white/50'
                }`}
                aria-label={`${i + 1}번째 이미지로 이동`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
