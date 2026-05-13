'use client';

import { motion } from 'framer-motion';

import SectionContainer from '@/components/layout/SectionContainer';
import type { BeanSummaryDTO } from '@/lib/api/products';

interface ProductInfoTableProps {
  beanSummary: BeanSummaryDTO;
  description: string;
}

export function ProductInfoTable({ beanSummary, description }: ProductInfoTableProps) {
  const infoItems = [
    { label: '국가', value: beanSummary.origin },
    { label: '지역', value: beanSummary.region },
    { label: '가공 방식', value: beanSummary.process },
  ].filter((item) => item.value !== undefined && item.value !== null && item.value !== '');

  return (
    <SectionContainer className="py-6 md:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16"
      >
        <div className="flex flex-col justify-center lg:col-span-8">
          <h2 className="font-playfair mb-6 text-[clamp(1.5rem,4vw,2.5rem)] font-bold text-gray-900">
            Bean Details
          </h2>
          {description ? (
            <p className="text-[clamp(1rem,2vw,1.125rem)] leading-relaxed whitespace-pre-wrap text-gray-600">
              {description}
            </p>
          ) : (
            <p className="text-gray-400 italic">상세 설명이 준비되지 않았습니다.</p>
          )}
        </div>

        <div className="h-fit rounded-2xl border border-gray-100 bg-gray-50 p-8 lg:col-span-4">
          <ul className="space-y-6">
            {infoItems.map((item, i) => (
              <li
                key={i}
                className="flex flex-col border-b border-gray-200 pb-4 last:border-0 last:pb-0"
              >
                <span className="font-outfit mb-1 text-xs font-semibold tracking-widest text-amber-600 uppercase">
                  {item.label}
                </span>
                <span className="font-medium text-gray-900">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </SectionContainer>
  );
}
