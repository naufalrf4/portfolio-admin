'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { AnalyticsDashboardData } from '../types/analytics.types';

export function useAnalyticsDashboard(range: '7d' | '30d' | '90d') {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDashboard() {
      setLoading(true);
      try {
        const response = await fetch(`/api/v1/admin/analytics?range=${range}`, {
          signal: controller.signal,
        });
        const payload = await response.json();
        if (payload.success) {
          setData(payload.data);
        } else {
          toast.error(payload.error?.message || 'Failed to load analytics');
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to load analytics');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();

    return () => {
      controller.abort();
    };
  }, [range]);

  return { data, loading };
}
