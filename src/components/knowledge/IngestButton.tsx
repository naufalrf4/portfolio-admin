'use client';

import { useState } from 'react';
import { Database, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface IngestButtonProps {
  docId: string;
  indexed: boolean;
  onIngest: (id: string) => Promise<boolean>;
}

export function IngestButton({ docId, indexed, onIngest }: IngestButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleIngest = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      const result = await onIngest(docId);
      if (result) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={success ? 'primary' : 'ghost'}
            size="icon-sm"
            onClick={handleIngest}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : success ? (
              <Check className="h-4 w-4" />
            ) : (
              <Database className="h-4 w-4 text-[var(--teal)]" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {loading
            ? 'Ingesting...'
            : success
              ? 'Ingested!'
              : indexed
                ? 'Re-ingest to RAG'
                : 'Ingest to RAG'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
