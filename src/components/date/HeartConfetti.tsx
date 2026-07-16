'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

type Props = {
  active: boolean;
};

export function HeartConfetti({ active }: Props) {
  const reduce = useReducedMotion();
  const [items, setItems] = useState<
    { id: number; x: number; delay: number; size: number; rot: number }[]
  >([]);

  useEffect(() => {
    if (!active || reduce) {
      setItems([]);
      return;
    }
    setItems(
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.8,
        size: 14 + Math.random() * 22,
        rot: -40 + Math.random() * 80,
      }))
    );
    const t = window.setTimeout(() => setItems([]), 6500);
    return () => window.clearTimeout(t);
  }, [active, reduce]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <AnimatePresence>
        {items.map((item) => (
          <motion.span
            key={item.id}
            initial={{ y: '105%', opacity: 0, x: `${item.x}vw`, rotate: 0 }}
            animate={{
              y: '-20%',
              opacity: [0, 1, 1, 0],
              rotate: item.rot,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 4.8 + Math.random(),
              delay: item.delay,
              ease: 'easeOut',
            }}
            className="absolute bottom-0 text-rose-500"
            style={{ fontSize: item.size, left: 0 }}
          >
            ♥
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
