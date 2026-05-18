'use client';

import { ChevronDown, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export type DifficultyType = '전체' | '입문' | '중급' | '전문가';

export interface ClassFilterState {
  region: string | null;
  difficulty: DifficultyType;
}

interface ClassFilterBarProps {
  filters: ClassFilterState;
  onChangeFilters: (filters: ClassFilterState) => void;
  searchQuery: string;
  onChangeSearch: (query: string) => void;
  onSearchSubmit: () => void;
  availableRegions: string[];
}

const DIFFICULTIES: DifficultyType[] = ['전체', '입문', '중급', '전문가'];

export function ClassFilterBar({
  filters,
  onChangeFilters,
  searchQuery,
  onChangeSearch,
  onSearchSubmit,
  availableRegions,
}: ClassFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [localRegion, setLocalRegion] = useState<string | null>(filters.region);
  const [localDifficulty, setLocalDifficulty] = useState<DifficultyType>(filters.difficulty);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setLocalRegion(filters.region);
    setLocalDifficulty(filters.difficulty);
  }, [filters.region, filters.difficulty]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };

  const handleSubmit = () => {
    onChangeFilters({
      region: localRegion,
      difficulty: localDifficulty,
    });
    onChangeSearch(localSearch);
    onSearchSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl bg-[#F8F8F8] p-4 shadow-sm md:p-5 lg:flex-row lg:items-end lg:gap-5">
      {/* Region + Difficulty Group for Mobile Row */}
      <div className="flex w-full shrink-0 flex-row gap-3 lg:w-auto">
        {/* 1. REGION */}
        <div className="flex flex-1 flex-col gap-2 lg:w-44 lg:flex-none">
          <label className="ml-1 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
            지역
          </label>
          <div className="relative">
            <select
              value={localRegion ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                setLocalRegion(val === '' ? null : val);
              }}
              className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-transparent bg-white px-4 pr-10 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#4A3629]/20"
            >
              <option value="">전체 지역</option>
              {availableRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* 2. DIFFICULTY */}
        <div className="flex flex-1 flex-col gap-2 lg:w-44 lg:flex-none">
          <label className="ml-1 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
            난이도
          </label>
          <div className="relative">
            <select
              value={localDifficulty}
              onChange={(e) => setLocalDifficulty(e.target.value as DifficultyType)}
              className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-transparent bg-white px-4 pr-10 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-[#4A3629]/20"
            >
              {DIFFICULTIES.map((diff) => (
                <option key={diff} value={diff}>
                  {diff === '전체' ? '전체 난이도' : diff}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* 3. SEARCH */}
      <div className="flex w-full flex-col gap-2 lg:flex-1">
        <label className="ml-1 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
          검색
        </label>
        <div className="relative w-full">
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={localSearch}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder="클래스명, 바리스타, 지역 검색"
            className="h-12 w-full rounded-xl border border-transparent bg-white pr-4 pl-11 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#4A3629]/20"
          />
        </div>
      </div>

      {/* 4. BUTTON */}
      <button
        onClick={handleSubmit}
        className="h-12 w-full shrink-0 rounded-xl bg-[#3D261D] px-6 text-sm font-bold text-white transition-all hover:bg-[#2A1A14] active:scale-95 lg:w-auto"
      >
        클래스 검색하기
      </button>
    </div>
  );
}
