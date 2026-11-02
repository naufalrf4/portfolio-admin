'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { IngestButton } from './IngestButton';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/utils/date';

interface KnowledgeDoc {
  id: string;
  filename: string;
  content: string;
  indexed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeTableProps {
  docs: KnowledgeDoc[];
  loading: boolean;
  onDelete: (id: string) => Promise<boolean>;
  onIngest: (id: string) => Promise<boolean>;
}

export function KnowledgeTable({ docs, loading, onDelete, onIngest }: KnowledgeTableProps) {
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState<KnowledgeDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = (doc: KnowledgeDoc) => {
    setDeletingDoc(doc);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingDoc) return;
    setIsDeleting(true);
    try {
      const success = await onDelete(deletingDoc.id);
      if (success) {
        setDeleteModalOpen(false);
        setDeletingDoc(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return formatDateTime(dateString);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (docs.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div
          className={cn(
            'mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4',
            'bg-[var(--bg-elevated)]',
            'shadow-surface-sunken'
          )}
        >
          <FileText className="h-8 w-8 text-[var(--text-secondary)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Knowledge Documents</h3>
        <p className="text-[var(--text-secondary)] mb-4">Get started by adding your first knowledge document.</p>
        <Button variant="primary" asChild>
          <Link href="/knowledge/new">Add Document</Link>
        </Button>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-line">
              <TableHead className="text-[var(--text-secondary)]">Filename</TableHead>
              <TableHead className="text-[var(--text-secondary)]">Status</TableHead>
              <TableHead className="text-[var(--text-secondary)] hidden md:table-cell">Content Preview</TableHead>
              <TableHead className="text-[var(--text-secondary)]">Updated</TableHead>
              <TableHead className="text-[var(--text-secondary)] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docs.map((doc) => (
              <TableRow
                key={doc.id}
                className="border-b border-line/50 hover:bg-[var(--bg-elevated)]/50 transition-colors"
              >
                <TableCell className="font-medium text-[var(--text-primary)]">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[var(--teal)]" />
                    {doc.filename}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={doc.indexed ? 'success' : 'warning'}>
                    {doc.indexed ? 'Indexed' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell className="text-[var(--text-secondary)] text-sm hidden md:table-cell">
                  <div className="line-clamp-2 max-w-md">{doc.content}</div>
                </TableCell>
                <TableCell className="text-[var(--text-secondary)] text-sm whitespace-nowrap">
                  {formatDate(doc.updatedAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <IngestButton docId={doc.id} indexed={doc.indexed} onIngest={onIngest} />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => router.push(`/knowledge/${doc.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => openDeleteModal(doc)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        filename={deletingDoc?.filename}
      />
    </>
  );
}
