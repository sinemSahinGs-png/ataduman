'use client';

import { useEffect } from 'react';

const TITLES = {
  tr: 'ATA DUMAN — Özel Web Sitesi Tasarımı',
  en: 'ATA DUMAN — Custom Website Design',
} as const;

const DESCS = {
  tr: 'Ata Duman — özel web sitesi tasarımı, web geliştirme, Instagram otomasyonu ve dijital deneyimler.',
  en: 'Ata Duman — custom website design, web development, Instagram automation, and digital experiences.',
} as const;

function applyMeta(locale: 'tr' | 'en') {
  document.title = TITLES[locale];
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', DESCS[locale]);
  document.documentElement.lang = locale;
  try {
    localStorage.setItem('portfolio_locale', locale);
  } catch {
    /* ignore */
  }
}

type Props = {
  locale?: 'tr' | 'en';
};

export function HomePage({ locale = 'tr' }: Props) {
  useEffect(() => {
    applyMeta(locale);
  }, [locale]);

  return (
    <iframe
      src={`/legacy/index.html?lang=${locale}`}
      title="ATA DUMAN"
      className="fixed inset-0 h-[100dvh] w-full border-0"
    />
  );
}
