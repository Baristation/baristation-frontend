'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, SearchX } from 'lucide-react';

import type { LessonSummary } from '@/lib/api/lessons';

import { ClassCard } from './ClassCard';

function SkeletonCard() {
  return (
    <div
      className="animate-pulse overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm"
      style={{ aspectRatio: '3/4' }}
    />
  );
}

interface ClassCardListProps {
  lessons: LessonSummary[];
  isLoading: boolean;
  hasNext?: boolean;
  onLoadMore: () => void;
  isLoadingMore: boolean;
  onResetFilters?: () => void;
}

export function ClassCardList({
  lessons,
  isLoading,
  hasNext,
  onLoadMore,
  isLoadingMore,
  onResetFilters,
}: ClassCardListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-4 py-24 text-center">
        <SearchX className="h-12 w-12 text-gray-300" />
        <p className="font-outfit text-lg font-bold text-gray-700">조건에 맞는 클래스가 없습니다</p>
        <p className="font-inter text-sm text-gray-500">검색어나 필터 조건을 조정해보세요</p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="mt-2 rounded-full border border-gray-200 px-6 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900"
          >
            필터 초기화
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={lessons[0]?.lessonId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {lessons.map((lesson, i) => (
            <ClassCard key={lesson.lessonId} {...lesson} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Load More */}
      {hasNext && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="group flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-10 py-3.5 text-sm font-bold text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:text-gray-900 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                불러오는 중...
              </>
            ) : (
              '클래스 더 보기'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
