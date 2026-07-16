'use client';

import { useReducedMotion } from 'framer-motion';

type Props = {
  tone?: 'default' | 'celebrate' | 'calm';
};

/** Soft editorial atmosphere — optional photo under a heavy ivory veil */
export function DateAmbientBackground({ tone = 'default' }: Props) {
  const reduce = useReducedMotion();

  const wash =
    tone === 'celebrate'
      ? 'from-[#efe2da]/75 via-[#ebd6d8]/88 to-[#dfc4c8]'
      : tone === 'calm'
        ? 'from-[#f4ebe4]/80 via-[#f0e4e2]/90 to-[#e9d8d4]'
        : 'from-[#f6efe8]/70 via-[#f2e8e2]/85 to-[#ebe0d8]';

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#f3ebe4]" />

      {/* Optional custom photo — stays soft under veil */}
      <div
        className="absolute inset-0 scale-[1.06] bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url('/date-bg.jpg')" }}
      />

      <div className={`absolute inset-0 bg-gradient-to-b ${wash}`} />

      {/* Soft abstract shapes */}
      <div className="absolute -left-24 top-[8%] h-[42vmin] w-[42vmin] rounded-full bg-[#e8c9b8]/40 blur-[70px]" />
      <div className="absolute -right-20 top-[18%] h-[48vmin] w-[48vmin] rounded-full bg-[#d4a8b2]/30 blur-[80px]" />
      <div className="absolute bottom-[-10%] left-[20%] h-[36vmin] w-[36vmin] rounded-full bg-[#c99aa5]/22 blur-[70px]" />

      {!reduce && (
        <>
          <span className="date-orb absolute left-[10%] top-[22%] h-1.5 w-1.5 rounded-full bg-[#b57a86]/40" />
          <span
            className="date-orb absolute right-[14%] top-[30%] h-2 w-2 rounded-full bg-[#c4a484]/35"
            style={{ animationDelay: '1.6s' }}
          />
          <span
            className="date-orb absolute bottom-[28%] left-[18%] h-1 w-1 rounded-full bg-[#9d5c6c]/30"
            style={{ animationDelay: '3.2s' }}
          />
          <span className="date-drift absolute right-[18%] bottom-[34%] text-[10px] text-[#b57a86]/25">
            ♥
          </span>
          <span
            className="date-drift absolute left-[12%] top-[38%] text-[9px] text-[#c4a484]/22"
            style={{ animationDelay: '4s' }}
          >
            ♥
          </span>
        </>
      )}

      <div className="date-grain absolute inset-0 opacity-[0.28] mix-blend-multiply" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f6efe8]/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#ebe0d8]/90 to-transparent" />
    </div>
  );
}
