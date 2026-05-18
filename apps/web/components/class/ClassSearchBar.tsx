'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ClassSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ClassSearchBar({
  value,
  onChange,
  placeholder = '클래스명, 바리스타명, 지역으로 검색',
}: ClassSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(val);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      onChange(localValue);
    }
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="relative w-full">
      <Search
        className={`absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transition-colors ${
          isFocused ? 'text-gray-900' : 'text-gray-400'
        }`}
      />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="font-inter h-12 w-full rounded-2xl border border-gray-200 bg-white pr-10 pl-11 text-sm text-gray-900 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="검색어 초기화"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
