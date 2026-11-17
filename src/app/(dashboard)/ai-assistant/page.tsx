import type { Metadata } from 'next';
import { Bot } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AiConfigTab } from '@/features/knowledge/components';

export const metadata: Metadata = {
  title: 'AI Assistant',
  description: 'Configure assistant providers, JEv safety, routing, and tools.',
};

export default function AiAssistantPage() {
  return (
    <PageWrapper>
      <PageHeader
        title="AI Assistant"
        description="Choose models, define safety and routing rules, and control which tools the assistant can use."
        icon={<Bot />}
      />
      <div className="mt-6">
        <AiConfigTab />
      </div>
    </PageWrapper>
  );
}
