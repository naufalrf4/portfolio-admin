'use client';
import type { LucideIcon } from 'lucide-react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageWrapper } from '@/components/layout/PageWrapper';
interface ErrorStateProps {
    title?: string;
    message: string;
    onRetry: () => void;
    icon?: LucideIcon;
}
export function ErrorState({ title = 'Something went wrong', message, onRetry, icon: Icon = AlertCircle, }: ErrorStateProps) {
    return (<PageWrapper className="p-6">
      <Card className="p-8">
        <CardContent className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-[var(--error)]/10 text-[var(--error)]">
            <Icon className="h-8 w-8"/>
          </div>
          <h2 className="text-xl font-display font-semibold text-[var(--text-primary)] mb-2">{title}</h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md">
            {message}
          </p>
          <Button onClick={onRetry} variant="primary">
            <RefreshCw className="h-4 w-4 mr-2"/>
            Try Again
          </Button>
        </CardContent>
      </Card>
    </PageWrapper>);
}
