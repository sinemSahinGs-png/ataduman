import type { Metadata } from 'next';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Date Admin — ATA DUMAN',
  robots: { index: false, follow: false },
};

export default function DateAdminPage() {
  return <AdminDashboard />;
}
