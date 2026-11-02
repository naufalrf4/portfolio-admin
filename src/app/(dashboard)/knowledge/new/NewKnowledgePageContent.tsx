'use client';

import { useState } from 'react';
import { FilePlus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { KnowledgeForm } from '@/components/knowledge';

export function NewKnowledgePageContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: { filename: string; content: string }): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/admin/knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        return true;
      }

      return false;
    } catch (error) {
      void error;
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <PageHeader
        title="New Knowledge Document"
        description="Extract, review, and save transient knowledge content before ingesting it into AI retrieval."
        icon={<FilePlus />}
      />

      <KnowledgeForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </PageWrapper>
  );
}
