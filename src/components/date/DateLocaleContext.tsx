'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DATE_LOCALE_KEY,
  dictionaries,
  readStoredLocale,
  type DateLocale,
} from '@/lib/date/i18n';

type DateLocaleContextValue = {
  locale: DateLocale;
  setLocale: (locale: DateLocale) => void;
  t: (typeof dictionaries)['tr'];
};

const DateLocaleContext = createContext<DateLocaleContextValue | null>(null);

export function DateLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<DateLocale>('tr');

  useEffect(() => {
    setLocaleState(readStoredLocale());
  }, []);

  const setLocale = useCallback((next: DateLocale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(DATE_LOCALE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: dictionaries[locale],
    }),
    [locale, setLocale]
  );

  return (
    <DateLocaleContext.Provider value={value}>{children}</DateLocaleContext.Provider>
  );
}

export function useDateLocale() {
  const ctx = useContext(DateLocaleContext);
  if (!ctx) {
    throw new Error('useDateLocale must be used within DateLocaleProvider');
  }
  return ctx;
}

export function DateLanguageToggle() {
  const { locale, setLocale } = useDateLocale();

  return (
    <div
      className="pointer-events-auto absolute right-0 top-0 z-30 flex items-center gap-0.5 rounded-full border border-[#e4cfd4]/90 bg-[rgba(255,250,246,0.82)] p-1 shadow-[0_8px_24px_rgba(92,40,52,0.08)] backdrop-blur-md"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLocale('tr')}
        aria-pressed={locale === 'tr'}
        className={`min-w-[2.5rem] rounded-full px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.16em] transition ${
          locale === 'tr'
            ? 'bg-[#6b2a3c] text-[#fff7f4]'
            : 'text-[#8a6570] hover:text-[#5c3340]'
        }`}
      >
        TR
      </button>
      <button
        type="button"
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
        className={`min-w-[2.5rem] rounded-full px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.16em] transition ${
          locale === 'en'
            ? 'bg-[#6b2a3c] text-[#fff7f4]'
            : 'text-[#8a6570] hover:text-[#5c3340]'
        }`}
      >
        ENG
      </button>
    </div>
  );
}
