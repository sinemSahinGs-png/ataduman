'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { forwardRef } from 'react';
import { useDateLocale } from '@/components/date/DateLocaleContext';

type Props = {
  onClick: () => void;
  className?: string;
};

export const YesButton = forwardRef<HTMLButtonElement, Props>(
  function YesButton({ onClick, className = '' }, ref) {
    const reduce = useReducedMotion();
    const { t } = useDateLocale();

    return (
      <motion.button
        ref={ref}
        type="button"
        onClick={onClick}
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        whileHover={reduce ? undefined : { scale: 1.02, y: -1 }}
        whileTap={reduce ? undefined : { scale: 0.98 }}
        className={`date-yes-btn relative z-20 flex h-[52px] w-full items-center justify-center overflow-hidden rounded-full bg-[#6b2a3c] text-[13px] font-semibold tracking-[0.14em] text-[#fff7f4] sm:text-[14px] ${className}`}
      >
        <span className="date-yes-sheen" aria-hidden />
        <span className="date-yes-glow" aria-hidden />
        <span className="relative z-[1]">{t.yes}</span>
      </motion.button>
    );
  }
);
