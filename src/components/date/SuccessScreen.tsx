'use client';

import { motion } from 'framer-motion';
import { formatTurkishDate } from '@/lib/date/utils';

type Props = {
  name: string;
  honorific: string;
  maleName: string;
  selectedDate: string;
};

export function SuccessScreen({ name, honorific, maleName, selectedDate }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-[20rem] w-full flex-col items-center justify-center text-center"
    >
      <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.28em] text-[#9a7480]">
        Onaylandı
      </p>
      <h2 className="mb-3 font-serif text-[1.9rem] font-medium leading-tight tracking-[-0.02em] text-[#3d1f2a] sm:text-[2.15rem]">
        Date onaylandı.
      </h2>
      <p className="mx-auto mb-8 max-w-[16.5rem] text-[13.5px] leading-relaxed text-[#7d5964]">
        {name} {honorific} ve {maleName} için zarif bir gün seçildi.
      </p>

      <div className="mb-7 rounded-[20px] border border-[#ead5da]/90 bg-white/55 px-7 py-4 shadow-[0_12px_32px_rgba(92,40,52,0.06)]">
        <p className="mb-1 text-[9px] uppercase tracking-[0.22em] text-[#9a7480]">
          Seçilen tarih
        </p>
        <p className="font-serif text-[1.35rem] text-[#6b2a3c]">
          {formatTurkishDate(selectedDate)}
        </p>
      </div>

      <p className="text-[12px] leading-relaxed text-[#9a7480]">
        Ata Duman bu cevabı unutmayacak.
      </p>
    </motion.div>
  );
}
