'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DatePickerCard } from '@/components/date/DatePickerCard';
import { FloatingHearts } from '@/components/date/FloatingHearts';
import { HeartConfetti } from '@/components/date/HeartConfetti';
import { RunawayNoButton } from '@/components/date/RunawayNoButton';
import { SuccessScreen } from '@/components/date/SuccessScreen';
import { buildQuestion } from '@/lib/date/utils';
import type { DateInvite, DateResponse } from '@/lib/date/supabase';

type Phase = 'question' | 'picking' | 'success';

type Props = {
  invite: DateInvite;
  initialResponse: DateResponse | null;
  cookieAnsweredDate: string | null;
};

function storageKey(slug: string) {
  return `date_answered_${slug}`;
}

function sessionKey(slug: string) {
  return `date_session_${slug}`;
}

function getOrCreateSessionId(slug: string): string {
  try {
    const existing = localStorage.getItem(sessionKey(slug));
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(sessionKey(slug), id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function DateInviteExperience({
  invite,
  initialResponse,
  cookieAnsweredDate,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);

  const initialDate =
    initialResponse?.selected_date ||
    cookieAnsweredDate ||
    null;

  const [phase, setPhase] = useState<Phase>(initialDate ? 'success' : 'question');
  const [selectedDate, setSelectedDate] = useState(initialDate || '');
  const [hint, setHint] = useState('Cevabınızı dikkatli seçmeniz önerilir.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(Boolean(initialDate));
  const [calm, setCalm] = useState(Boolean(initialDate));

  const question = useMemo(
    () =>
      buildQuestion(
        invite.name,
        invite.honorific,
        invite.male_name,
        invite.custom_question
      ),
    [invite]
  );

  useEffect(() => {
    void fetch('/api/date/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: invite.slug }),
    });
  }, [invite.slug]);

  useEffect(() => {
    if (!initialDate) {
      try {
        const raw = localStorage.getItem(storageKey(invite.slug));
        if (raw) {
          const parsed = JSON.parse(raw) as { selected_date?: string };
          if (parsed.selected_date) {
            setSelectedDate(parsed.selected_date);
            setPhase('success');
            setCelebrate(true);
            setCalm(true);
          }
        }
      } catch {
        /* ignore */
      }
    }
  }, [initialDate, invite.slug]);

  useEffect(() => {
    if (phase !== 'success' || calm) return;
    const t = window.setTimeout(() => setCalm(true), 6000);
    return () => window.clearTimeout(t);
  }, [phase, calm]);

  const onYes = () => {
    setPhase('picking');
    setError(null);
  };

  const onConfirm = async () => {
    if (!selectedDate || loading) return;
    setLoading(true);
    setError(null);
    try {
      const session_id = getOrCreateSessionId(invite.slug);
      const res = await fetch('/api/date/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: invite.slug,
          selected_date: selectedDate,
          session_id,
          source: 'web',
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        selected_date?: string;
      };
      if (!res.ok) {
        setError(data.error || 'Bir hata oluştu');
        setLoading(false);
        return;
      }
      const saved = data.selected_date || selectedDate;
      setSelectedDate(saved);
      try {
        localStorage.setItem(
          storageKey(invite.slug),
          JSON.stringify({ selected_date: saved, at: Date.now() })
        );
      } catch {
        /* ignore */
      }
      setCelebrate(true);
      setPhase('success');
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (!invite.is_active && phase === 'question' && !initialDate) {
    return (
      <div className="relative flex min-h-[100dvh] items-center justify-center bg-[#f7efe8] px-4">
        <p className="rounded-3xl bg-white/80 px-6 py-8 text-center text-[#5c1a2a] shadow-lg">
          Bu davet şu an aktif değil.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative flex min-h-[100dvh] items-center justify-center overflow-x-hidden px-4 py-8 transition-colors duration-1000 ${
        phase === 'success'
          ? calm
            ? 'bg-gradient-to-b from-[#f8e7ee] via-[#f3d5df] to-[#e8c4cf]'
            : 'bg-gradient-to-b from-[#f4c2d0] via-[#e89aaf] to-[#8b1e3f]'
          : 'bg-[#f7efe8]'
      }`}
    >
      <FloatingHearts count={phase === 'success' ? 28 : 16} />
      <HeartConfetti active={celebrate && phase === 'success' && !calm} />

      <motion.div
        ref={cardRef}
        layout
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/60 bg-white/55 p-6 shadow-[0_20px_60px_rgba(92,26,42,0.12)] backdrop-blur-xl sm:p-8"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(circle at 20% 10%, rgba(255,215,180,0.45), transparent 40%), radial-gradient(circle at 80% 0%, rgba(244,180,196,0.35), transparent 35%)',
          }}
        />

        <div className="relative">
          <AnimatePresence mode="wait">
            {phase === 'question' ? (
              <motion.div
                key="q"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
              >
                <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-[#9a6b74]">
                  Size özel bir soru var 💌
                </p>
                <h1 className="mb-4 text-center font-serif text-[1.65rem] leading-snug text-[#4a1f2c] sm:text-4xl">
                  {question}
                </h1>
                <p className="mb-8 min-h-[1.25rem] text-center text-sm text-[#8a5a64]">{hint}</p>

                <div className="relative flex min-h-[3.5rem] flex-wrap items-center justify-center gap-3">
                  <button
                    ref={yesRef}
                    type="button"
                    onClick={onYes}
                    className="relative z-10 rounded-full bg-gradient-to-r from-[#8b1e3f] to-[#c2314d] px-8 py-3.5 text-base font-semibold text-white shadow-[0_0_24px_rgba(194,49,77,0.45)] transition hover:scale-105 active:scale-[0.98]"
                  >
                    EVET 💖
                  </button>
                  <RunawayNoButton
                    cardRef={cardRef}
                    yesRef={yesRef}
                    onHintChange={setHint}
                  />
                </div>
              </motion.div>
            ) : null}

            {phase === 'picking' ? (
              <motion.div
                key="pick"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <DatePickerCard
                  selectedDate={selectedDate}
                  onChange={setSelectedDate}
                  onConfirm={onConfirm}
                  loading={loading}
                  error={error}
                />
              </motion.div>
            ) : null}

            {phase === 'success' ? (
              <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <SuccessScreen
                  name={invite.name}
                  honorific={invite.honorific}
                  maleName={invite.male_name}
                  selectedDate={selectedDate}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
