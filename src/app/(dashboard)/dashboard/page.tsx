import type { Metadata } from 'next';
import { DashboardPageContent } from './DashboardPageContent';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your portfolio content and view statistics',
};

export default function DashboardPage() {
  return <DashboardPageContent />;
}
