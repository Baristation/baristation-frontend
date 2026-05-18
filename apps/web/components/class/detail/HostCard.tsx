'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface HostCardProps {
  hostName: string;
  hostProfileUrl: string;
  careers: string[];
}

export function HostCard({ hostName, hostProfileUrl, careers }: HostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex items-start gap-5 rounded-[24px] bg-[#F8F9FA] p-6 shadow-sm"
    >
      {/* Profile Image */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[20px] bg-gray-200">
        <Image src={hostProfileUrl} alt={hostName} fill className="object-cover" sizes="96px" />
      </div>

      {/* Info */}
      <div className="flex flex-col justify-center py-1">
        <div>
          <p className="font-outfit text-[11px] font-bold tracking-wider text-gray-800 uppercase">
            Instructor
          </p>
          <h3 className="font-inter mt-1 text-xl font-bold text-gray-900">{hostName}</h3>
        </div>

        {careers.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {careers.map((career) => (
              <span
                key={career}
                className="font-outfit rounded-md bg-[#E8C5C0] px-2 py-0.5 text-[10px] font-bold tracking-tight text-amber-950"
              >
                {career}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
