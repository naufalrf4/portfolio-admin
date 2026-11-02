import type { Metadata } from 'next';
import { LogsPageContent } from './LogsPageContent';

export const metadata: Metadata = {
  title: 'Application Logs',
  description: 'View and manage centralized application logs across portfolio ecosystem services',
};

export default function LogsPage() {
  return <LogsPageContent />;
}
