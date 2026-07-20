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
}

export function HomePage() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem('portfolio_locale');
      if (stored === 'en' || stored === 'tr') applyMeta(stored);
    } catch {
      /* ignore */
    }

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; locale?: string } | null;
      if (!data || data.type !== 'ataduman-locale') return;
      if (data.locale === 'en' || data.locale === 'tr') applyMeta(data.locale);
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <iframe
      src="/legacy/index.html"
      title="ATA DUMAN"
      className="fixed inset-0 h-[100dvh] w-full border-0"
    />
  );
}
