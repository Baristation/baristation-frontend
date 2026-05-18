'use client';

import { Loader2, Star } from 'lucide-react';
import { useState, useEffect, use } from 'react';

import { BookingSidebar } from '@/components/class/detail/BookingSidebar';
import { CurriculumSection } from '@/components/class/detail/CurriculumSection';
import { HostCard } from '@/components/class/detail/HostCard';
import { LessonImageGallery } from '@/components/class/detail/LessonImageGallery';
import { QuickInfoGrid } from '@/components/class/detail/QuickInfoGrid';
import { RefundPolicySection } from '@/components/class/detail/RefundPolicySection';
import PageContainer from '@/components/layout/PageContainer';
import { fetchLessonDetail, type LessonDetailResponse } from '@/lib/mocks/classDetail';

interface ClassDetailPageProps {
  params: Promise<{
    lessonId: string;
  }>;
}

export default function ClassDetailPage(props: ClassDetailPageProps) {
  const params = use(props.params);
  const lessonId = parseInt(params.lessonId, 10);

  const [data, setData] = useState<LessonDetailResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await fetchLessonDetail(lessonId);
        setData(res.data);
      } catch (err) {
        setError('클래스 정보를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [lessonId]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex w-full flex-1 flex-col bg-[#FAFAFA]">
          <div className="flex min-h-[50vh] flex-col items-center justify-center py-8 md:py-12">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-amber-500" />
            <p className="text-gray-500">정보를 불러오는 중입니다...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer>
        <div className="flex w-full flex-1 flex-col bg-[#FAFAFA]">
          <div className="flex min-h-[50vh] flex-col items-center justify-center py-8 md:py-12">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Error</h2>
            <p className="text-gray-500">{error}</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex w-full flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 pb-32 md:px-8 md:py-12 lg:flex-row lg:items-start lg:gap-12 lg:pb-12">
          {/* Main Content Area */}
          <div className="flex w-full max-w-4xl flex-1 flex-col gap-12">
            {/* 1. Hero Image Gallery */}
            <section>
              <LessonImageGallery images={data.lessonImages} />
            </section>

            {/* 2. Title & Host Card */}
            <section className="flex flex-col gap-6">
              <div className="mb-2 flex items-center gap-2">
                <span className="font-outfit rounded-full bg-[#F5E6E3] px-3 py-1 text-xs font-bold tracking-wider text-[#A54729] uppercase">
                  MASTERCLASS
                </span>
                <span className="font-outfit rounded-full bg-gray-200 px-3 py-1 text-xs font-bold tracking-wider text-gray-700 uppercase">
                  LEVEL 01
                </span>
              </div>
              <h1 className="font-playfair text-3xl leading-tight font-bold text-gray-900 md:text-4xl lg:text-5xl">
                {data.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="flex items-center gap-1 font-medium text-gray-700">
                  <Star className="h-4 w-4 fill-gray-800 text-gray-800" />
                  4.9 (128 reviews)
                </span>
                <span>·</span>
                <span>
                  {data.city} {data.place}
                </span>
              </div>
              <div className="mt-4">
                <HostCard
                  hostName={data.hostName}
                  hostProfileUrl={data.hostProfileUrl}
                  careers={data.careers}
                />
              </div>
            </section>

            {/* 3. Quick Info Grid */}
            <section>
              <QuickInfoGrid
                region={data.region}
                city={data.city}
                place={data.place}
                duration={data.duration}
                nextDate={data.schedules.length > 0 ? data.schedules[0] : null}
              />
            </section>

            {/* 4. Curriculum */}
            <section className="flex flex-col gap-6">
              <h2 className="font-outfit text-2xl font-bold text-gray-900">커리큘럼</h2>
              <CurriculumSection curriculum={data.curriculum} />
            </section>

            {/* 5. Refund Policy */}
            <section className="flex flex-col gap-6">
              <h2 className="font-outfit text-2xl font-bold text-gray-900">취소 및 환불 규정</h2>
              <RefundPolicySection />
            </section>
          </div>

          {/* Sidebar Area */}
          <BookingSidebar
            lessonId={data.lessonId}
            price={data.price}
            selectedDate={selectedDate}
            schedules={data.schedules}
            remainingSeats={data.remainingSeats}
            onSelectDate={setSelectedDate}
          />
        </div>
      </div>
    </PageContainer>
  );
}
