'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useNotificationSummary } from '../hooks/useNotificationSummary';
import type { NotificationSummary } from '../hooks/useNotificationSummary';

const NotificationSummaryContext = createContext<NotificationSummary | null>(null);

export function NotificationSummaryProvider({ children }: { children: ReactNode }) {
  const summary = useNotificationSummary();

  return (
    <NotificationSummaryContext.Provider value={summary}>
      {children}
    </NotificationSummaryContext.Provider>
  );
}

export function useSharedNotificationSummary(): NotificationSummary {
  const context = useContext(NotificationSummaryContext);

  if (!context) {
    throw new Error(
      'useSharedNotificationSummary must be used inside NotificationSummaryProvider'
    );
  }

  return context;
}
