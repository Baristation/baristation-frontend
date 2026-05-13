'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  delay?: number;
}

export function Tooltip({ content, children, delay = 0.2 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useRef(`tooltip-${Math.random().toString(36).slice(2, 9)}`);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.top + window.scrollY, // Use absolute position relative to document
      });
    }
  };

  const handleMouseEnter = () => {
    updateCoords(); // Update immediately on enter
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay * 1000);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsVisible(true);
    } else if (e.key === 'Escape') {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    // Also update on scroll/resize if visible
    const handleUpdate = () => {
      if (isVisible) updateCoords();
    };
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-describedby={isVisible ? id.current : undefined}
      className="relative inline-block focus:outline-none"
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <TooltipPortal id={id.current} x={coords.x} y={coords.y}>
            {content}
          </TooltipPortal>
        )}
      </AnimatePresence>
    </div>
  );
}

function TooltipPortal({
  id,
  x,
  y,
  children,
}: {
  id: string;
  x: number;
  y: number;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      id={id}
      role="tooltip"
      initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-100%' }}
      animate={{ opacity: 1, scale: 1, x: '-50%', y: '-100%', marginTop: -10 }}
      exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-100%' }}
      transition={{ type: 'spring', damping: 20, stiffness: 400 }}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transformOrigin: 'bottom center',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      className="flex flex-col items-center"
    >
      <div className="relative whitespace-nowrap rounded-lg border border-white/10 bg-gray-900/95 px-3 py-1.5 text-[11px] font-semibold text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md">
        {children}
        {/* Diamond Arrow centered at the bottom */}
        <div
          className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-white/10 bg-gray-900/95"
          style={{ zIndex: -1 }}
        />
      </div>
    </motion.div>,
    document.body,
  );
}
