'use client';

import { motion } from 'framer-motion';

import type { CurriculumItem } from '@/lib/mocks/classDetail';

interface CurriculumSectionProps {
  curriculum: CurriculumItem[];
}

export function CurriculumSection({ curriculum }: CurriculumSectionProps) {
  if (curriculum.length === 0) return null;

  const sorted = [...curriculum].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="flex flex-col gap-0">
      {sorted.map((item, i) => (
        <motion.div
          key={item.sortOrder}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: i * 0.1 }}
          className={`flex items-start gap-6 py-8 ${
            i < sorted.length - 1 ? 'border-b border-gray-100' : ''
          }`}
        >
          {/* Large numbering */}
          <span className="font-playfair w-16 shrink-0 text-6xl leading-none font-bold text-[#F5E6E3] select-none">
            {String(i + 1).padStart(2, '0')}
          </span>

          {/* Content */}
          <div className="flex flex-col gap-2 pt-1">
            <h3 className="font-outfit text-lg font-bold text-gray-900">{item.title}</h3>
            <p className="font-inter text-sm leading-relaxed text-gray-500">{item.subTitle}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
