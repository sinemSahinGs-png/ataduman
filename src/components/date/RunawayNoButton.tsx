'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

const LABELS = [
  'HAYIR',
  'Emin misiniz?',
  'Bence tekrar düşünün',
  'Bu buton çalışmıyor',
  'EVET daha yakın 🙂',
];

const HINTS = [
  'Bu kadar hızlı vazgeçmeyin.',
  'Buton biraz utangaç.',
  'Sanırım doğru cevap diğer tarafta.',
  'Ata Duman bu kısmı özellikle hazırladı.',
  'Kader sizi EVET butonuna yönlendiriyor.',
];

type Props = {
  cardRef: React.RefObject<HTMLElement | null>;
  yesRef: React.RefObject<HTMLElement | null>;
  onHintChange: (hint: string) => void;
};

type Pos = { x: number; y: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function RunawayNoButton({ cardRef, yesRef, onHintChange }: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const [escaped, setEscaped] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const flee = useCallback(() => {
    const btn = btnRef.current;
    const card = cardRef.current;
    if (!btn || !card) return;

    const cardRect = card.getBoundingClientRect();
    const yesRect = yesRef.current?.getBoundingClientRect();
    const btnW = btn.offsetWidth || 120;
    const btnH = btn.offsetHeight || 48;

    let absX = clamp(
      Math.random() * (cardRect.width - btnW - 24) + 12,
      12,
      Math.max(12, cardRect.width - btnW - 12)
    );
    let absY = clamp(
      Math.random() * (cardRect.height - btnH - 80) + 70,
      70,
      Math.max(70, cardRect.height - btnH - 16)
    );

    if (yesRect) {
      const localYes = {
        left: yesRect.left - cardRect.left,
        top: yesRect.top - cardRect.top,
        right: yesRect.right - cardRect.left,
        bottom: yesRect.bottom - cardRect.top,
      };
      const overlaps =
        absX < localYes.right + 16 &&
        absX + btnW > localYes.left - 16 &&
        absY < localYes.bottom + 16 &&
        absY + btnH > localYes.top - 16;
      if (overlaps) {
        absY = localYes.top > cardRect.height / 2 ? 80 : cardRect.height - btnH - 24;
        absX =
          absX < cardRect.width / 2 ? cardRect.width - btnW - 16 : 16;
      }
    }

    setEscaped(true);
    setPos({ x: absX, y: absY });
    setAttempts((a) => {
      const nextA = a + 1;
      onHintChange(HINTS[(nextA - 1) % HINTS.length]);
      return nextA;
    });
  }, [cardRef, yesRef, onHintChange]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const btn = btnRef.current;
      if (!btn || reduce) return;
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      if (dist < 120) flee();
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [flee, reduce]);

  const label = LABELS[Math.min(attempts, LABELS.length - 1)];

  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    flee();
  };

  const style = escaped
    ? ({
        position: 'absolute' as const,
        left: pos.x,
        top: pos.y,
        zIndex: 20,
      } as const)
    : undefined;

  return (
    <motion.button
      ref={btnRef}
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      onPointerDown={handlePointerDown}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onKeyDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      style={style}
      className="rounded-full border border-rose-200/80 bg-white/70 px-5 py-2.5 text-sm font-medium text-rose-900/70 shadow-sm backdrop-blur-md select-none"
      animate={escaped ? { left: pos.x, top: pos.y } : undefined}
      transition={
        reduce
          ? { duration: 0 }
          : { type: 'spring', stiffness: 420, damping: 18, mass: 0.6 }
      }
    >
      {label}
    </motion.button>
  );
}
