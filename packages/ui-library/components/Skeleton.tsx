'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../lib/utils';

interface SkeletonProps extends HTMLMotionProps<'div'> {}

/**
 * Skeleton - 프리미엄 펄스 효과를 지원하는 로딩 플레이스홀더
 */
function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={cn('rounded-md bg-white/10', className)}
      {...props}
    />
  );
}

export { Skeleton };
