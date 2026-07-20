import type { Metadata } from 'next';
import { HomePage } from './HomePage';

export const metadata: Metadata = {
  title: 'ATA DUMAN — Özel Web Sitesi Tasarımı',
  description:
    'Ata Duman — özel web sitesi tasarımı, web geliştirme, Instagram otomasyonu ve dijital deneyimler.',
  alternates: {
    canonical: '/',
    languages: {
      tr: '/',
      en: '/eng',
    },
  },
};

export default function Page() {
  return <HomePage locale="tr" />;
}
