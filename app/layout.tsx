import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';

const serif = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-date-serif',
});

const sans = Manrope({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-date-sans',
});

export const metadata: Metadata = {
  title: 'ATA DUMAN — Özel Web Sitesi Tasarımı',
  description:
    'Ata Duman — özel web sitesi tasarımı, web geliştirme, Instagram otomasyonu ve dijital deneyimler.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={`${serif.variable} ${sans.variable} antialiased`}>{children}</body>
    </html>
  );
}
