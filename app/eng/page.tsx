import type { Metadata } from 'next';
import { HomePage } from '../HomePage';

export const metadata: Metadata = {
  title: 'ATA DUMAN — Custom Website Design',
  description:
    'Ata Duman — custom website design, web development, Instagram automation, and digital experiences.',
  alternates: {
    canonical: '/eng',
    languages: {
      tr: '/',
      en: '/eng',
    },
  },
};

export default function EngPage() {
  return <HomePage locale="en" />;
}
