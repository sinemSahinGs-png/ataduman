'use client';

import { motion } from 'framer-motion';
import { formatTurkishDate, todayISODate } from '@/lib/date/utils';

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
  const min = todayISODate();
  const label = selectedDate ? formatTurkishDate(selectedDate, true) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      <p className="mb-2 text-center font-serif text-3xl text-[#5c1a2a] sm:text-4xl">
        Harika bir karar. 💖
      </p>
      <p className="mb-6 text-center text-sm text-[#7a4a55] sm:text-base">
        Şimdi size uygun olan tarihi seçin.
      </p>

      <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#9a6b74]">
        Date tarihi
      </label>
      <input
        type="date"
        min={min}
        value={selectedDate}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-rose-200/80 bg-white/80 px-4 py-3 text-base text-[#4a1f2c] outline-none ring-rose-300/50 focus:ring-2"
      />

      {label ? (
        <p className="mt-3 text-center text-sm text-[#6d3a46]">
          Seçilen: <span className="font-medium">{label}</span>
        </p>
      ) : (
        <p className="mt-3 text-center text-sm text-[#9a6b74]">Bir tarih seçin</p>
      )}

      {error ? (
        <p className="mt-3 text-center text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        disabled={!selectedDate || loading}
        onClick={onConfirm}
        className="mt-6 w-full rounded-full bg-gradient-to-r from-[#8b1e3f] to-[#c2314d] px-6 py-3.5 text-base font-semibold text-white shadow-[0_10px_30px_rgba(139,30,63,0.35)] transition enabled:hover:scale-[1.02] enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Kaydediliyor…' : "Date'i Onayla 💖"}
      </button>
    </motion.div>
  );
}
