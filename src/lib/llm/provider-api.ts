import { db } from '@/lib/db';
import { llmSettings } from '@/lib/db/schema';

export type LlmSlot = 'main' | 'fallback' | 'embedding';

export const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

const storedKeyColumn = {
  main: llmSettings.mainApiKey,
  fallback: llmSettings.fallbackApiKey,
  embedding: llmSettings.embeddingApiKey,
} as const;

export async function resolveApiKey(slot: LlmSlot, provided: string | undefined): Promise<string> {
  if (provided && provided.length > 0) {
    return provided;
  }

  const rows = await db.select({ key: storedKeyColumn[slot] }).from(llmSettings).limit(1);
  return rows[0]?.key ?? '';
}

export function resolveBaseUrl(provider: 'openai-compatible' | 'gemini', baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/$/, '');
  if (trimmed.length > 0) return trimmed;
  return provider === 'gemini' ? GEMINI_BASE_URL : 'https://api.openai.com';
}

export function normalizeGeminiModel(model: string): string {
  return model.startsWith('models/') ? model : `models/${model}`;
}

export async function fetchJson(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; status: number; body: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, status: res.status, body: body.slice(0, 200) };
    }
    return { ok: true, data: (await res.json()) as Record<string, unknown> };
  } finally {
    clearTimeout(timeout);
  }
}
