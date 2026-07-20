'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DateAmbientBackground } from '@/components/date/DateAmbientBackground';
import { DateGlassCard } from '@/components/date/DateGlassCard';
import {
  DateLanguageToggle,
  DateLocaleProvider,
  useDateLocale,
} from '@/components/date/DateLocaleContext';
import { DatePickerCard } from '@/components/date/DatePickerCard';
import { FloatingHearts } from '@/components/date/FloatingHearts';
import { HeartConfetti } from '@/components/date/HeartConfetti';
import { RunawayNoButton } from '@/components/date/RunawayNoButton';
import { SuccessScreen } from '@/components/date/SuccessScreen';
import { YesButton } from '@/components/date/YesButton';
import {
  buildLocalizedQuestion,
  localizeApiError,
} from '@/lib/date/i18n';
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

function DateInviteExperienceInner({
  invite,
  initialResponse,
  cookieAnsweredDate,
}: Props) {
  const { locale, t } = useDateLocale();
  const cardRef = useRef<HTMLDivElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);

  const initialDate =
    initialResponse?.selected_date || cookieAnsweredDate || null;

  const [phase, setPhase] = useState<Phase>(initialDate ? 'success' : 'question');
  const [selectedDate, setSelectedDate] = useState(initialDate || '');
  const [hint, setHint] = useState(t.defaultHint);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawError, setRawError] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(Boolean(initialDate));
  const [calm, setCalm] = useState(Boolean(initialDate));

  const question = useMemo(
    () =>
      buildLocalizedQuestion(
        locale,
        invite.name,
        invite.honorific,
        invite.male_name,
        invite.custom_question
      ),
    [invite, locale]
  );

  useEffect(() => {
    setHint(t.defaultHint);
  }, [locale, t.defaultHint]);

  useEffect(() => {
    if (!rawError) {
      setError(null);
      return;
    }
    setError(localizeApiError(rawError, locale));
  }, [locale, rawError]);

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
    const timer = window.setTimeout(() => setCalm(true), 4800);
    return () => window.clearTimeout(timer);
  }, [phase, calm]);

  const onYes = () => {
    setPhase('picking');
    setRawError(null);
  };

  const onConfirm = async () => {
    if (!selectedDate || loading) return;
    setLoading(true);
    setRawError(null);
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
        setRawError(data.error || t.errorFallback);
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
      setCalm(false);
      setPhase('success');
    } catch {
      setRawError(t.errorNetwork);
    } finally {
      setLoading(false);
    }
  };

  const tone =
    phase === 'success' ? (calm ? 'calm' : 'celebrate') : 'default';

  if (!invite.is_active && phase === 'question' && !initialDate) {
    return (
      <div className="relative flex min-h-[100dvh] items-center justify-center px-5 pt-[max(3.5rem,env(safe-area-inset-top))]">
        <DateAmbientBackground />
        <div className="absolute inset-x-5 top-[max(1rem,env(safe-area-inset-top))] mx-auto w-full max-w-[380px]">
          <div className="relative h-10">
            <DateLanguageToggle />
          </div>
        </div>
        <DateGlassCard>
          <p className="text-center text-[15px] text-[#5c3340]">{t.inactive}</p>
        </DateGlassCard>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-x-hidden px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(3.75rem,calc(env(safe-area-inset-top)+2.75rem))]">
      <DateAmbientBackground tone={tone} />
      <FloatingHearts count={phase === 'success' ? 10 : 6} />
      <HeartConfetti active={celebrate && phase === 'success' && !calm} />

      <div className="absolute inset-x-5 top-[max(1rem,env(safe-area-inset-top))] z-30 mx-auto w-full max-w-[380px]">
        <div className="relative h-10">
          <DateLanguageToggle />
        </div>
      </div>

      <div className="relative z-10 w-full">
        <DateGlassCard cardRef={cardRef}>
          <AnimatePresence mode="wait">
            {phase === 'question' ? (
              <motion.div
                key={`q-${locale}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12, transition: { duration: 0.28 } }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex min-h-[21.5rem] flex-col"
              >
                <p className="mb-5 text-center text-[10px] font-medium uppercase tracking-[0.3em] text-[#9a7480]">
                  {t.eyebrow}
                </p>

                <h1 className="mb-6 text-balance text-center font-serif text-[1.65rem] font-medium leading-[1.28] tracking-[-0.02em] text-[#3d1f2a] sm:text-[1.9rem]">
                  {question}
                </h1>

                <div className="mx-auto mb-auto min-h-[2.5rem] max-w-[16rem] text-center text-[13px] leading-relaxed text-[#8a6570]">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={hint}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.28 }}
                      className="block"
                    >
                      {hint}
                    </motion.span>
                  </AnimatePresence>
                </div>

                <div className="mt-8 grid w-full grid-cols-2 items-stretch gap-3 sm:gap-4">
                  <YesButton ref={yesRef} onClick={onYes} />
                  <div className="relative min-h-[52px]">
                    <RunawayNoButton
                      cardRef={cardRef}
                      yesRef={yesRef}
                      onHintChange={setHint}
                    />
                  </div>
                </div>
              </motion.div>
            ) : null}

            {phase === 'picking' ? (
              <motion.div key={`pick-${locale}`}>
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
              <motion.div key={`ok-${locale}`}>
                <SuccessScreen
                  name={invite.name}
                  honorific={invite.honorific}
                  maleName={invite.male_name}
                  selectedDate={selectedDate}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </DateGlassCard>
      </div>
    </div>
  );
}

export function DateInviteExperience(props: Props) {
  return (
    <DateLocaleProvider>
      <DateInviteExperienceInner {...props} />
    </DateLocaleProvider>
  );
}
