'use client';

import { CalendarDays, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { LessonScheduleCalendar } from '@/components/class/detail/LessonScheduleCalendar';

interface BookingSidebarProps {
  lessonId: number;
  price: number;
  selectedDate: string | null;
  schedules: string[];
  remainingSeats?: number;
  onSelectDate: (date: string) => void;
}

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR');
}

function formatSelectedDate(dateStr: string) {
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    }) +
    ' ' +
    d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  );
}

export function BookingSidebar({
  lessonId,
  price,
  selectedDate,
  schedules,
  remainingSeats,
  onSelectDate,
}: BookingSidebarProps) {
  const router = useRouter();
  const canBook = !!selectedDate && (remainingSeats === undefined || remainingSeats > 0);
  const isSoldOut = typeof remainingSeats === 'number' && remainingSeats === 0;

  const handleBook = () => {
    if (!canBook || isSoldOut) return;
    router.push(`/classes/${lessonId}/booking?date=${encodeURIComponent(selectedDate!)}`);
  };

  return (
    <>
      {/* ── Desktop: Sticky Sidebar ── */}
      <aside className="sticky top-24 hidden h-fit w-80 shrink-0 flex-col gap-6 lg:flex">
        {/* 달력 섹션 */}
        <LessonScheduleCalendar
          schedules={schedules}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          remainingSeats={remainingSeats}
        />

        {/* 가격 + 신청하기 섹션 */}
        <div className="flex flex-col gap-5 rounded-[24px] border border-gray-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          {/* 가격 */}
          <div className="flex items-baseline gap-1">
            <span className="font-outfit text-4xl font-bold text-gray-900">
              {formatPrice(price)}
            </span>
            <span className="font-inter text-base text-gray-500">원</span>
          </div>

          {/* 선택한 날짜 */}
          {selectedDate ? (
            <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
              <CalendarDays className="h-4 w-4 shrink-0 text-[#A54729]" />
              <span className="font-inter text-sm font-bold text-orange-900">
                {formatSelectedDate(selectedDate)}
              </span>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center">
              <p className="font-inter text-sm text-gray-500">날짜를 선택해주세요</p>
            </div>
          )}

          {/* CTA 버튼 */}
          <button
            onClick={handleBook}
            disabled={!canBook || isSoldOut}
            className={`font-outfit flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold transition-all ${
              canBook && !isSoldOut
                ? 'bg-[#A54729] text-white shadow-md hover:bg-orange-900 hover:shadow-lg active:scale-[0.98]'
                : 'cursor-not-allowed border border-gray-200 bg-gray-50 text-gray-400'
            }`}
          >
            {isSoldOut ? (
              '마감된 일정입니다'
            ) : (
              <>
                지금 바로 신청하기
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Mobile: Fixed Bottom Bar ── */}
      <div className="fixed right-0 bottom-0 left-0 z-50 flex items-center justify-between border-t border-gray-200 bg-white/95 px-5 py-4 backdrop-blur-sm lg:hidden">
        <div>
          <p className="font-outfit text-xl font-bold text-gray-900">
            {formatPrice(price)}
            <span className="font-inter ml-0.5 text-sm font-normal text-gray-500">원</span>
          </p>
          {selectedDate && (
            <p className="font-inter mt-0.5 text-xs font-bold text-[#A54729]">
              {formatSelectedDate(selectedDate)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleBook}
            disabled={!canBook || isSoldOut}
            className={`font-outfit flex items-center gap-1.5 rounded-2xl px-6 py-3 text-sm font-bold transition-all ${
              canBook && !isSoldOut
                ? 'bg-[#A54729] text-white hover:bg-orange-900 active:scale-95'
                : 'cursor-not-allowed bg-gray-100 text-gray-400'
            }`}
          >
            {isSoldOut ? '마감' : selectedDate ? '신청하기' : '날짜 선택 후 신청'}
          </button>
        </div>
      </div>
    </>
  );
}
