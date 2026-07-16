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
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="w-full text-center"
    >
      <p className="mb-3 font-serif text-3xl text-[#5c1a2a] sm:text-5xl">Date onaylandı. 💖</p>
      <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-[#7a4a55] sm:text-base">
        {name} {honorific} ve {maleName} için güzel bir gün seçildi.
      </p>
      <p className="mb-4 font-serif text-2xl text-[#8b1e3f] sm:text-3xl">
        {formatTurkishDate(selectedDate)}
      </p>
      <p className="text-xs text-[#9a6b74] sm:text-sm">
        Ata Duman bu cevabı kesinlikle unutmayacak.
      </p>
    </motion.div>
  );
}
