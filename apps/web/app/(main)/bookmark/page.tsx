'use client';

import { useQuery } from '@tanstack/react-query';
import { Bookmark as BookmarkIcon } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useMemo } from 'react';

import { getBookmarksAction } from '@/actions/bookmarks.action';
import PageContainer from '@/components/layout/PageContainer';
import ProductCardList from '@/components/products/ProductCardList';
import { mapBookmarkItemToProductInfo } from '@/lib/api/bookmarks';

function BookmarkPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 0;

  const {
    data: bookmarkResult,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['bookmarks', currentPage],
    queryFn: async () => {
      const res = await getBookmarksAction(currentPage, 12);
      if (!res.success) {
        throw new Error(res.error || 'Failed to fetch bookmarks');
      }
      return res.data;
    },
  });

  const products = useMemo(() => {
    if (!bookmarkResult?.content) return [];
    return bookmarkResult.content.map(mapBookmarkItemToProductInfo);
  }, [bookmarkResult]);

  const handlePageChange = (page: number) => {
    router.push(`/bookmark?page=${page}`, { scroll: true });
  };

  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <BookmarkIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-playfair text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                Saved Beans
              </h1>
              <p className="font-outfit mt-1 text-sm text-gray-500">
                북마크한 원두 목록 ({bookmarkResult?.totalElements || 0})
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="flex h-64 w-full flex-col items-center justify-center rounded-2xl bg-gray-50 text-center">
            <p className="text-sm font-medium text-red-500">{(error as Error).message}</p>
          </div>
        ) : (
          <ProductCardList
            products={products}
            isLoading={isLoading}
            pageInfo={
              bookmarkResult
                ? {
                    currentPage: bookmarkResult.currentPage,
                    size: bookmarkResult.size,
                    totalElements: bookmarkResult.totalElements,
                    totalPages: bookmarkResult.totalPages,
                    hasNext: bookmarkResult.hasNext,
                    hasPrevious: bookmarkResult.hasPrevious,
                  }
                : undefined
            }
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </PageContainer>
  );
}

export default function BookmarkPage() {
  return (
    <Suspense>
      <BookmarkPageContent />
    </Suspense>
  );
}
