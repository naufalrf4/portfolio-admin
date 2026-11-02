import type { Metadata } from 'next';
import { AnalyticsPageContent } from './AnalyticsPageContent';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'View analytics and insights for your portfolio',
};

export default function AnalyticsPage() {
  return <AnalyticsPageContent />;
}
