'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { ClassCardList } from '@/components/class/ClassCardList';
import { ClassFilterBar, ClassFilterState } from '@/components/class/ClassFilterBar';
import PageContainer from '@/components/layout/PageContainer';
import { fetchLessons, availableRegions } from '@/lib/mocks/class';

export default function ClassPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ClassFilterState>({
    region: null,
    difficulty: '전체',
  });

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['lessons', filters, searchQuery],
    queryFn: ({ pageParam = 0 }) =>
      fetchLessons({ ...filters, keyword: searchQuery, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.data.page.hasNext ? lastPage.data.page.number + 1 : undefined,
    initialPageParam: 0,
  });

  const lessons = data?.pages.flatMap((page) => page.data.content) ?? [];

  const handleResetFilters = () => {
    setFilters({ region: null, difficulty: '전체' });
    setSearchQuery('');
  };

  return (
    <PageContainer>
      <div className="flex w-full flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
          {/* Header Section */}
          <section className="flex flex-col gap-3">
            <h1 className="font-playfair text-4xl font-bold text-gray-900 md:text-5xl">
              Find Your Coffee Class
            </h1>
            <p className="font-inter text-base text-gray-500">
              다양한 커피 클래스에서 나만의 취향을 발견해보세요.
            </p>
          </section>

          {/* Filter & Search Section */}
          <section className="sticky top-0 z-40 -mx-4 bg-white/95 px-4 py-4 backdrop-blur-sm md:top-16 md:mx-0 md:px-0">
            <ClassFilterBar
              filters={filters}
              onChangeFilters={setFilters}
              searchQuery={searchQuery}
              onChangeSearch={setSearchQuery}
              onSearchSubmit={() => {}} // Search is already debounced, button can just exist or perform any explicit action if needed
              availableRegions={availableRegions}
            />
          </section>

          {/* List Section */}
          <section className="w-full">
            <ClassCardList
              lessons={lessons}
              isLoading={isLoading}
              hasNext={hasNextPage}
              onLoadMore={() => fetchNextPage()}
              isLoadingMore={isFetchingNextPage}
              onResetFilters={handleResetFilters}
            />
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
