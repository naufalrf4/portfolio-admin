'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileEdit, Database, Trash2, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { KnowledgeForm } from '@/components/knowledge';
import { DeleteConfirmModal } from '@/components/knowledge/DeleteConfirmModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface KnowledgeDoc {
  id: string;
  filename: string;
  content: string;
  indexed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EditKnowledgePageContentProps {
  id: string;
}

export function EditKnowledgePageContent({ id }: EditKnowledgePageContentProps) {
  const router = useRouter();
  const [doc, setDoc] = useState<KnowledgeDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoc = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/admin/knowledge/${id}`);
      const data = await response.json();
      if (data.success) {
        setDoc(data.data);
      } else {
        setError('Document not found');
      }
    } catch (error) {
      void error;
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  const handleSubmit = async (data: { filename: string; content: string }): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/admin/knowledge/${id}`, {
        method: 'PUT',
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

  const handleIngest = async () => {
    setIsIngesting(true);
    try {
      const response = await fetch(`/api/v1/admin/knowledge/${id}/ingest`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setDoc((prev) => (prev ? { ...prev, indexed: true } : null));
      }
    } catch (error) {
      void error;
    } finally {
      setIsIngesting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/v1/admin/knowledge/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        router.push('/knowledge');
      }
    } catch (error) {
      void error;
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Card className="mt-6">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  if (error || !doc) {
    return (
      <PageWrapper>
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Document Not Found</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            {error || 'The requested document could not be found.'}
          </p>
          <Button onClick={() => router.push('/knowledge')}>Back to Knowledge Base</Button>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Edit Knowledge Document"
        description={`Editing: ${doc.filename}`}
        icon={<FileEdit />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={handleIngest} disabled={isIngesting}>
              {isIngesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ingesting...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  {doc.indexed ? 'Re-ingest to RAG' : 'Ingest to RAG'}
                </>
              )}
            </Button>
            <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        }
      />

      <KnowledgeForm doc={doc} onSubmit={handleSubmit} isSubmitting={isSubmitting} />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        filename={doc.filename}
      />
    </PageWrapper>
  );
}
