'use client';

import { useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';

/** Sparse, soft accents — not a heart storm */
export function FloatingHearts({ count = 7 }: { count?: number }) {
  const reduce = useReducedMotion();
  const hearts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${8 + ((i * 13) % 80)}%`,
        size: 8 + (i % 3) * 2,
        delay: i * 1.1,
        duration: 14 + (i % 4) * 2,
        opacity: 0.12 + (i % 3) * 0.04,
      })),
    [count]
  );

  if (reduce) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {hearts.map((h) => (
        <span
          key={h.id}
          className="date-float-heart absolute text-[#b57a86]"
          style={{
            left: h.left,
            bottom: '-6%',
            fontSize: h.size,
            opacity: h.opacity,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}
