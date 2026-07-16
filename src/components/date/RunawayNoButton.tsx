'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

const LABELS = [
  'Hayır',
  'Emin misiniz?',
  'Tekrar düşünün',
  'Yanlış seçenek',
  'O buton bugün yoğun',
  'EVET daha mantıklı',
  'Bir daha deneyin',
  'Buna basmak zor 🙂',
  'Sanırım diğer buton daha iyi',
];

const HINTS = [
  'Güzel cevaplar genelde acele etmez.',
  'Bu seçenek biraz çekingen — diğerini deneyin.',
  'Kalbiniz muhtemelen doğru yeri biliyor.',
  'Nazik bir teklif, net bir jest ister.',
  'Kaçan butonlar, doğru kararları hatırlatır.',
  'Belki de EVET daha zarif duruyor.',
];

const BTN_H = 52;

type Props = {
  cardRef: React.RefObject<HTMLElement | null>;
  yesRef: React.RefObject<HTMLElement | null>;
  onHintChange: (hint: string) => void;
};

type Pos = { x: number; y: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hitsYesZone(
  x: number,
  y: number,
  w: number,
  h: number,
  yes: DOMRect,
  pad = 28
) {
  return !(
    x + w < yes.left - pad ||
    x > yes.right + pad ||
    y + h < yes.top - pad ||
    y > yes.bottom + pad
  );
}

export function RunawayNoButton({ cardRef, yesRef, onHintChange }: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const [escaped, setEscaped] = useState(false);
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: 0, h: BTN_H });
  const [attempts, setAttempts] = useState(0);
  const [flash, setFlash] = useState(0);
  const lastFlee = useRef(0);
  const fleeing = useRef(false);

  const measure = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return { w: 140, h: BTN_H };
    const r = btn.getBoundingClientRect();
    return { w: Math.max(r.width, 120), h: BTN_H };
  }, []);

  const pickPos = useCallback((): Pos | null => {
    const card = cardRef.current;
    const btn = btnRef.current;
    if (!card) return null;

    const cardRect = card.getBoundingClientRect();
    const yes = yesRef.current?.getBoundingClientRect();
    const dims = measure();
    const w = dims.w || Math.max(btn?.offsetWidth || 0, 120);
    const h = BTN_H;
    const pad = 14;

    const minX = cardRect.left + pad;
    const maxX = cardRect.right - w - pad;
    const minY = cardRect.top + 56;
    const maxY = yes
      ? Math.min(cardRect.bottom - h - pad, yes.top - h - 20)
      : cardRect.bottom - h - pad;

    const corners = [
      { x: minX, y: minY },
      { x: Math.max(minX, maxX), y: minY },
      { x: minX, y: Math.max(minY, Math.min(maxY, cardRect.top + 120)) },
      { x: Math.max(minX, maxX), y: Math.max(minY, Math.min(maxY, cardRect.top + 120)) },
    ];

    if (maxX <= minX || maxY <= minY) {
      const mid = (cardRect.left + cardRect.right) / 2;
      if (yes && yes.left > mid) return corners[0];
      return corners[1];
    }

    const cur = btn?.getBoundingClientRect();
    for (let i = 0; i < 70; i++) {
      const x = minX + Math.random() * (maxX - minX);
      const y = minY + Math.random() * (maxY - minY);
      if (yes && hitsYesZone(x, y, w, h, yes)) continue;
      if (cur && Math.hypot(x - cur.left, y - cur.top) < 90 && i < 50) continue;
      return { x, y };
    }

    for (const c of corners) {
      if (!yes || !hitsYesZone(c.x, c.y, w, h, yes)) return c;
    }
    return corners[0];
  }, [cardRef, yesRef, measure]);

  const flee = useCallback(
    (force = false) => {
      const now = performance.now();
      if (!force && now - lastFlee.current < 75) return;
      if (fleeing.current && !force) return;
      lastFlee.current = now;
      fleeing.current = true;

      const dims = measure();
      setSize(dims);

      const next = pickPos();
      if (!next) {
        fleeing.current = false;
        return;
      }

      if (!escaped && btnRef.current) {
        const cur = btnRef.current.getBoundingClientRect();
        setPos({ x: cur.left, y: cur.top });
        setEscaped(true);
        requestAnimationFrame(() => {
          setPos(next);
          fleeing.current = false;
        });
      } else {
        setEscaped(true);
        setPos(next);
        window.setTimeout(() => {
          fleeing.current = false;
        }, 200);
      }

      setFlash((n) => n + 1);
      setAttempts((a) => {
        const n = a + 1;
        onHintChange(HINTS[(n - 1) % HINTS.length]);
        return n;
      });
    },
    [escaped, measure, onHintChange, pickPos]
  );

  // Desktop proximity
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const btn = btnRef.current;
      if (!btn || reduce) return;
      const r = btn.getBoundingClientRect();
      const d = Math.hypot(
        e.clientX - (r.left + r.width / 2),
        e.clientY - (r.top + r.height / 2)
      );
      if (d < 135) flee(false);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [flee, reduce]);

  useLayoutEffect(() => {
    if (!escaped) return;
    const keepInBounds = () => {
      const next = pickPos();
      if (next) setPos(next);
    };
    window.addEventListener('resize', keepInBounds);
    window.addEventListener('scroll', keepInBounds, true);
    return () => {
      window.removeEventListener('resize', keepInBounds);
      window.removeEventListener('scroll', keepInBounds, true);
    };
  }, [escaped, pickPos]);

  const blockFlee = (e: ReactPointerEvent | React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    flee(true);
  };

  const label = LABELS[Math.min(attempts, LABELS.length - 1)];

  return (
    <motion.button
      ref={btnRef}
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      role="presentation"
      onPointerDownCapture={blockFlee}
      onPointerDown={blockFlee}
      onPointerUp={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onTouchStartCapture={blockFlee}
      onTouchStart={blockFlee}
      onKeyDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className={`date-no-btn flex touch-none select-none items-center justify-center overflow-hidden rounded-full border border-[#dfc6cc] bg-[rgba(255,250,246,0.94)] text-[13px] font-semibold tracking-[0.08em] text-[#6a4550] backdrop-blur-md sm:text-[14px] ${
        escaped ? 'fixed z-[70]' : 'relative z-10 h-[52px] w-full'
      }`}
      style={
        escaped
          ? {
              left: pos.x,
              top: pos.y,
              width: size.w,
              height: BTN_H,
              margin: 0,
            }
          : undefined
      }
      animate={
        escaped
          ? {
              left: pos.x,
              top: pos.y,
              scale: reduce ? 1 : [1, 1.03, 1],
              rotate: reduce ? 0 : [0, -1.5, 1.5, 0],
            }
          : { scale: 1, rotate: 0 }
      }
      transition={
        reduce
          ? { duration: 0 }
          : {
              left: { type: 'spring', stiffness: 420, damping: 26, mass: 0.5 },
              top: { type: 'spring', stiffness: 420, damping: 26, mass: 0.5 },
              scale: { duration: 0.28 },
              rotate: { duration: 0.28 },
            }
      }
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={`${flash}-${label}`}
          initial={reduce ? false : { opacity: 0, y: 6, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -5, filter: 'blur(4px)' }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-[1] block whitespace-nowrap px-2"
        >
          {label}
        </motion.span>
      </AnimatePresence>
      <span className="date-no-glow" aria-hidden />
    </motion.button>
  );
}
