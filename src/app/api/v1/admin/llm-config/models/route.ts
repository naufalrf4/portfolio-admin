import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { successResponse, errorResponse, serverErrorResponse, validationErrorResponse } from '@/lib/api/responses';
import { z } from 'zod';
import { fetchJson, resolveApiKey, resolveBaseUrl } from '@/lib/llm/provider-api';

const modelsQuerySchema = z.object({
  provider: z.enum(['openai-compatible', 'gemini']),
  baseUrl: z.string(),
  apiKey: z.string().optional(),
  slot: z.enum(['main', 'fallback', 'embedding']).default('main'),
});

const isEmbeddingModel = (id: string) => /embed/i.test(id);

interface GeminiModel {
  name?: string;
  supportedGenerationMethods?: string[];
}

function extractGeminiModels(data: Record<string, unknown>, embeddingSlot: boolean): string[] {
  const models = (data.models as GeminiModel[] | undefined) ?? [];
  const wanted = embeddingSlot ? ['embedContent', 'batchEmbedContents'] : ['generateContent'];

  return models
    .filter((model) => (model.supportedGenerationMethods ?? []).some((method) => wanted.includes(method)))
    .map((model) => (model.name ?? '').replace(/^models\//, ''))
    .filter((id) => id.length > 0)
    .sort();
}

function extractOpenAiModels(data: Record<string, unknown>, embeddingSlot: boolean): string[] {
  const items = (data.data as Array<{ id?: string }> | undefined) ?? [];

  return items
    .map((item) => item.id ?? '')
    .filter((id) => id.length > 0)
    .filter((id) => (embeddingSlot ? isEmbeddingModel(id) : !isEmbeddingModel(id)))
    .sort();
}

async function handlePost(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = modelsQuerySchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors);
    }

    const { provider, slot } = validation.data;
    const apiKey = await resolveApiKey(slot, validation.data.apiKey);

    if (apiKey.length === 0) {
      return errorResponse('No API key available for this slot', 400, 'API_KEY_REQUIRED');
    }

    const baseUrl = resolveBaseUrl(provider, validation.data.baseUrl);
    const embeddingSlot = slot === 'embedding';

    const url =
      provider === 'gemini'
        ? `${baseUrl}/models?key=${encodeURIComponent(apiKey)}&pageSize=200`
        : `${baseUrl}/v1/models`;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (provider !== 'gemini') {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const result = await fetchJson(url, { method: 'GET', headers }, 10_000);

    if (!result.ok) {
      return errorResponse(
        `Failed to fetch models from provider: ${result.status} ${result.body}`,
        502,
        'PROVIDER_MODEL_FETCH_FAILED',
      );
    }

    const models =
      provider === 'gemini'
        ? extractGeminiModels(result.data, embeddingSlot)
        : extractOpenAiModels(result.data, embeddingSlot);

    return successResponse({ models, provider });
  } catch {
    return serverErrorResponse('Failed to fetch models from provider');
  }
}

export const POST = withAdminAuth(handlePost);
