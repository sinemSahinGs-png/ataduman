'use client';

import { useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';

type Props = {
  count?: number;
  className?: string;
};

export function FloatingHearts({ count = 18, className = '' }: Props) {
  const reduce = useReducedMotion();
  const hearts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        size: 10 + (i % 5) * 4,
        delay: (i % 10) * 0.7,
        duration: 12 + (i % 6) * 2.5,
        opacity: 0.15 + (i % 5) * 0.06,
      })),
    [count]
  );

  if (reduce) {
    return (
      <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
        <div className="absolute left-[12%] top-[18%] text-2xl text-rose-300/30">♥</div>
        <div className="absolute right-[16%] top-[28%] text-xl text-rose-400/25">♥</div>
        <div className="absolute bottom-[22%] left-[40%] text-3xl text-[#8b1e3f]/20">♥</div>
      </div>
    );
  }

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {hearts.map((h) => (
        <span
          key={h.id}
          className="date-float-heart absolute text-rose-400"
          style={{
            left: h.left,
            bottom: '-10%',
            fontSize: h.size,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
            opacity: h.opacity,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}
