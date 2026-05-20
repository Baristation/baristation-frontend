'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface LessonScheduleCalendarProps {
  schedules: string[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  remainingSeats?: number;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getScheduleForDay(schedules: string[], day: Date): string | null {
  return schedules.find((s) => isSameDay(new Date(s), day)) ?? null;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function LessonScheduleCalendar({
  schedules,
  selectedDate,
  onSelectDate,
  remainingSeats,
}: LessonScheduleCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(
    schedules.length > 0 ? new Date(schedules[0]).getFullYear() : today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    schedules.length > 0 ? new Date(schedules[0]).getMonth() : today.getMonth(),
  );

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  };

  const cells: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ];

  if (schedules.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-[24px] border border-gray-100 bg-white px-8 py-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <p className="font-inter text-sm text-gray-500">등록된 일정이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-[24px] border border-gray-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          aria-label="이전 달"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-outfit text-sm font-bold text-gray-900">
          {viewYear}년 {viewMonth + 1}월
        </span>
        <button
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          aria-label="다음 달"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="mb-2 grid grid-cols-7 text-center">
        {WEEKDAYS.map((w) => (
          <div key={w} className="font-outfit py-1 text-xs font-bold text-gray-400">
            {w}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-y-2 text-center">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;

          const scheduleDateTime = getScheduleForDay(schedules, day);
          const hasSchedule = !!scheduleDateTime;
          const isSelected = selectedDate ? isSameDay(new Date(selectedDate), day) : false;
          const isPast = day < today && !isSameDay(day, today);

          return (
            <div key={day.getTime()} className="relative flex flex-col items-center py-1">
              <button
                disabled={!hasSchedule || isPast}
                onClick={() => scheduleDateTime && onSelectDate(scheduleDateTime)}
                className={`relative flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  isSelected
                    ? 'bg-[#A54729] text-white shadow-md'
                    : hasSchedule && !isPast
                      ? 'cursor-pointer text-gray-900 hover:bg-orange-50 hover:text-[#A54729]'
                      : 'cursor-not-allowed text-gray-300'
                }`}
              >
                {day.getDate()}
              </button>
              {hasSchedule && !isPast && (
                <span
                  className={`mt-0.5 text-[9px] leading-none font-bold transition-colors ${
                    isSelected
                      ? 'text-[#A54729]'
                      : remainingSeats === 0
                        ? 'animate-pulse text-rose-500'
                        : 'text-emerald-600'
                  }`}
                >
                  {/* {remainingSeats === 0 ? '마감' : `${remainingSeats}석`} */}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
