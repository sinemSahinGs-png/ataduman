'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function HeartConfetti({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const [items, setItems] = useState<
    { id: number; x: number; delay: number; size: number; rot: number; color: string }[]
  >([]);

  useEffect(() => {
    if (!active || reduce) {
      setItems([]);
      return;
    }
    const colors = ['#6b2a3c', '#b57a86', '#c4a484', '#9d5c6c'];
    setItems(
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        x: 10 + Math.random() * 80,
        delay: Math.random() * 0.45,
        size: 9 + Math.random() * 11,
        rot: -24 + Math.random() * 48,
        color: colors[i % colors.length],
      }))
    );
    const t = window.setTimeout(() => setItems([]), 4800);
    return () => window.clearTimeout(t);
  }, [active, reduce]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <AnimatePresence>
        {items.map((item) => (
          <motion.span
            key={item.id}
            initial={{ y: '108%', opacity: 0, left: `${item.x}%` }}
            animate={{ y: '-12%', opacity: [0, 0.75, 0.75, 0], rotate: item.rot }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 3.4 + Math.random() * 0.6,
              delay: item.delay,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute bottom-0"
            style={{ fontSize: item.size, color: item.color }}
          >
            ♥
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
