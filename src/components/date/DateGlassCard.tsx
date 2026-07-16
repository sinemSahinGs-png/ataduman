'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode, RefObject } from 'react';

type Props = {
  children: ReactNode;
  cardRef?: RefObject<HTMLDivElement | null>;
};

export function DateGlassCard({ children, cardRef }: Props) {
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-[380px]">
      <div className="absolute inset-x-6 -bottom-2.5 top-3 rounded-[28px] bg-[#c9a8b0]/15 blur-[2px]" />
      <div className="absolute inset-x-3 -bottom-1 top-1.5 rounded-[30px] bg-white/40" />

      <motion.div
        ref={cardRef}
        initial={reduce ? false : { opacity: 0, y: 32, scale: 0.975 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-visible rounded-[28px] border border-white/75 bg-[rgba(255,251,247,0.82)] px-6 py-8 shadow-[0_28px_64px_rgba(74,35,48,0.11),0_2px_0_rgba(255,255,255,0.8)_inset] backdrop-blur-2xl sm:px-8 sm:py-9"
      >
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]"
          style={{
            background:
              'linear-gradient(165deg, rgba(255,248,242,0.9) 0%, rgba(255,255,255,0.35) 42%, rgba(244,228,224,0.25) 100%)',
          }}
        />
        <div className="relative z-10">{children}</div>
      </motion.div>
    </div>
  );
}
