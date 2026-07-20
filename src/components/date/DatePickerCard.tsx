'use client';

import { motion } from 'framer-motion';
import { useDateLocale } from '@/components/date/DateLocaleContext';
import { formatInviteDate } from '@/lib/date/i18n';
import { todayISODate } from '@/lib/date/utils';

type Props = {
  selectedDate: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  loading: boolean;
  error: string | null;
};

export function DatePickerCard({
  selectedDate,
  onChange,
  onConfirm,
  loading,
  error,
}: Props) {
  const { locale, t } = useDateLocale();
  const min = todayISODate();
  const label = selectedDate ? formatInviteDate(selectedDate, locale, true) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-[21rem] w-full flex-col"
    >
      <p className="mb-3 text-center text-[10px] font-medium uppercase tracking-[0.28em] text-[#9a7480]">
        {t.pickerEyebrow}
      </p>
      <h2 className="mb-2 text-center font-serif text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-[#3d1f2a] sm:text-[1.95rem]">
        {t.pickerTitle}
      </h2>
      <p className="mb-8 text-center text-[13.5px] leading-relaxed text-[#7d5964]">
        {t.pickerSubtitle}
      </p>

      <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.2em] text-[#9a7480]">
        {t.pickerLabel}
      </label>
      <input
        type="date"
        min={min}
        value={selectedDate}
        onChange={(e) => onChange(e.target.value)}
        className="h-[52px] w-full rounded-2xl border border-[#e5d0d5] bg-white/75 px-4 text-[16px] text-[#3d1f2a] outline-none transition focus:border-[#b57a86] focus:ring-2 focus:ring-[#d7b8bf]/40"
      />

      <p className="mt-3 min-h-[1.25rem] text-center text-[13px] text-[#7d5964]">
        {label ? (
          <>
            {t.pickerSelected} ·{' '}
            <span className="font-medium text-[#5c3340]">{label}</span>
          </>
        ) : (
          t.pickerEmpty
        )}
      </p>

      {error ? (
        <p className="mt-2 text-center text-[13px] text-[#9b2c3c]" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-auto pt-8">
        <motion.button
          type="button"
          disabled={!selectedDate || loading}
          onClick={onConfirm}
          whileTap={!selectedDate || loading ? undefined : { scale: 0.98 }}
          className="date-yes-btn relative h-[52px] w-full overflow-hidden rounded-full bg-[#6b2a3c] text-[14px] font-semibold tracking-[0.08em] text-[#fff7f4] transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="date-yes-sheen" aria-hidden />
          <span className="relative z-[1]">
            {loading ? t.pickerConfirming : t.pickerConfirm}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
