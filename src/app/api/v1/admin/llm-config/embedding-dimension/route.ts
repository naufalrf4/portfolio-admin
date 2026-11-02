import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { successResponse, errorResponse, serverErrorResponse, validationErrorResponse } from '@/lib/api/responses';
import { z } from 'zod';
import { fetchJson, normalizeGeminiModel, resolveApiKey, resolveBaseUrl } from '@/lib/llm/provider-api';

const probeSchema = z.object({
  provider: z.enum(['openai-compatible', 'gemini']),
  baseUrl: z.string(),
  apiKey: z.string().optional(),
  model: z.string().min(1),
});

const PROBE_TEXT = 'dimension probe';

function extractOpenAiDimension(data: Record<string, unknown>): number {
  const items = (data.data as Array<{ embedding?: number[] }> | undefined) ?? [];
  return items[0]?.embedding?.length ?? 0;
}

function extractGeminiDimension(data: Record<string, unknown>): number {
  const embedding = data.embedding as { values?: number[] } | undefined;
  return embedding?.values?.length ?? 0;
}

async function handlePost(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = probeSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors);
    }

    const { provider, model } = validation.data;
    const apiKey = await resolveApiKey('embedding', validation.data.apiKey);

    if (apiKey.length === 0) {
      return errorResponse('No API key available for the embedding slot', 400, 'API_KEY_REQUIRED');
    }

    const baseUrl = resolveBaseUrl(provider, validation.data.baseUrl);

    const url =
      provider === 'gemini'
        ? `${baseUrl}/${normalizeGeminiModel(model)}:embedContent?key=${encodeURIComponent(apiKey)}`
        : `${baseUrl}/v1/embeddings`;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (provider !== 'gemini') {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const payload =
      provider === 'gemini'
        ? { model: normalizeGeminiModel(model), content: { parts: [{ text: PROBE_TEXT }] } }
        : { model, input: PROBE_TEXT };

    const result = await fetchJson(
      url,
      { method: 'POST', headers, body: JSON.stringify(payload) },
      15_000,
    );

    if (!result.ok) {
      return errorResponse(
        `Embedding probe failed: ${result.status} ${result.body}`,
        502,
        'EMBEDDING_PROBE_FAILED',
      );
    }

    const dimension =
      provider === 'gemini'
        ? extractGeminiDimension(result.data)
        : extractOpenAiDimension(result.data);

    if (dimension === 0) {
      return errorResponse('Provider returned no embedding vector', 502, 'EMBEDDING_PROBE_EMPTY');
    }

    return successResponse({ dimension, model });
  } catch {
    return serverErrorResponse('Failed to probe embedding dimension');
  }
}

export const POST = withAdminAuth(handlePost);
