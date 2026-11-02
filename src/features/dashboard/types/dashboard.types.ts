import type { ReactNode } from 'react';

export interface Stats {
  guestbook: { total: number; visible: number; hidden: number };
  messages: { total: number; unread: number; read: number };
  contacts: { total: number; unread: number; read: number };
  bookings: { total: number; pending: number; confirmed: number };
}

export interface StatCardProps {
  icon: ReactNode;
  iconColor: string;
  tone: 'blue' | 'purple' | 'emerald' | 'amber';
  title: string;
  total: number;
  primaryStat?: { label: string; value: number; variant: 'success' | 'warning' | 'muted' };
  secondaryStat?: { label: string; value: number; variant: 'success' | 'warning' | 'muted' };
  delay?: number;
}

export interface QuickAction {
  icon: ReactNode;
  label: string;
  href: string;
  delay: number;
}
