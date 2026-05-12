'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '../lib/utils';

interface RangeSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  colorPalette?: 'amber' | 'teal' | 'espresso';
}

const colorStyles = {
  amber: {
    track: 'bg-amber-100',
    range: 'bg-amber-500',
    thumb: 'border-amber-500 focus-visible:ring-amber-500',
  },
  teal: {
    track: 'bg-teal-100',
    range: 'bg-teal-500',
    thumb: 'border-teal-500 focus-visible:ring-teal-500',
  },
  espresso: {
    track: 'bg-stone-200',
    range: 'bg-stone-800',
    thumb: 'border-stone-800 focus-visible:ring-stone-800',
  },
};

const RangeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  RangeSliderProps
>(({ className, colorPalette = 'amber', ...props }, ref) => {
  const styles = colorStyles[colorPalette];

  // Radix UI Slider requires an array of values.
  // The number of thumbs is determined by the length of the value array.
  const values = props.value || props.defaultValue || [0];

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        'relative mx-auto flex w-[calc(100%-20px)] touch-none select-none items-center py-2',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn('relative h-2 w-full grow overflow-hidden rounded-full', styles.track)}
      >
        <SliderPrimitive.Range className={cn('absolute h-full', styles.range)} />
      </SliderPrimitive.Track>
      {values.map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className={cn(
            'block h-5 w-5 cursor-grab rounded-full border-2 bg-white shadow-sm transition-colors focus:outline-none active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50',
            styles.thumb,
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
});
RangeSlider.displayName = SliderPrimitive.Root.displayName;

export { RangeSlider };
