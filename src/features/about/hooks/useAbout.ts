'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils/api';
import type {
  AboutMeData,
  UpdateAboutInput,
  UseAboutOptions,
  UseAboutResult,
} from '../types/about.types';

const API_ENDPOINT = '/api/v1/admin/about';

function stringifyBio(value: AboutMeData['bio']): string | undefined {
  if (!value) {
    return undefined;
  }

  return typeof value === 'string' ? value : JSON.stringify(value);
}

function buildUpdatePayload(
  data: AboutMeData,
  patch: Partial<UpdateAboutInput> = {}
): UpdateAboutInput {
  return {
    fullName: data.fullName,
    email: data.email,
    skills: data.skills,
    roles: data.roles || [],
    tagline: data.tagline ?? undefined,
    shortBio: data.shortBio ?? undefined,
    bio: stringifyBio(data.bio),
    phone: data.phone ?? undefined,
    location: data.location ?? undefined,
    avatarUrl: data.avatarUrl ?? undefined,
    resumeUrl: data.resumeUrl ?? undefined,
    experience: data.experience ?? undefined,
    freelanceProfile: data.freelanceProfile ?? undefined,
    ...patch,
  };
}

export function useAbout(options: UseAboutOptions = {}): UseAboutResult {
  const { enabled = true } = options;

  const [data, setData] = useState<AboutMeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_ENDPOINT);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to load about data');
      }

      setData(result.data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      toast.error(getErrorMessage(err, 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateAbout = useCallback(async (input: UpdateAboutInput): Promise<boolean> => {
    setSaving(true);
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to save');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to save');
      }

      setData(result.data);
      toast.success('About data saved successfully');
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save about data'));
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateField = useCallback(
    async <K extends keyof UpdateAboutInput>(
      field: K,
      value: UpdateAboutInput[K]
    ): Promise<boolean> => {
      if (!data) return false;

      return updateAbout(buildUpdatePayload(data, { [field]: value }));
    },
    [data, updateAbout]
  );

  return {
    data,
    loading,
    saving,
    error,
    refetch: fetchData,
    updateAbout,
    updateField,
  };
}
