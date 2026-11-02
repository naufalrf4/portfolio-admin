import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { db } from '@/lib/db';
import { llmSettings } from '@/lib/db/schema';
import { successResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api/responses';
import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const llmConfigSchema = z.object({
  mainProvider: z.enum(['openai-compatible', 'gemini']),
  mainBaseUrl: z.string(),
  mainApiKey: z.string(),
  mainModel: z.string().min(1),
  fallbackProvider: z.enum(['openai-compatible', 'gemini']).nullable().optional(),
  fallbackBaseUrl: z.string().optional(),
  fallbackApiKey: z.string().optional(),
  fallbackModel: z.string().optional(),
  embeddingProvider: z.enum(['openai-compatible', 'gemini']),
  embeddingBaseUrl: z.string(),
  embeddingApiKey: z.string(),
  embeddingModel: z.string().min(1),
  embeddingDimension: z.number().int().positive().optional(),
});

async function handleGet() {
  try {
    const rows = await db.select().from(llmSettings).limit(1);
    const row = rows[0];

    if (!row) {
      return successResponse(null, 'No LLM config found');
    }

    return successResponse({
      id: row.id,
      mainProvider: row.mainProvider,
      mainBaseUrl: row.mainBaseUrl,
      mainApiKeySet: row.mainApiKey.length > 0,
      mainModel: row.mainModel,
      fallbackProvider: row.fallbackProvider ?? null,
      fallbackBaseUrl: row.fallbackBaseUrl ?? '',
      fallbackApiKeySet: (row.fallbackApiKey ?? '').length > 0,
      fallbackModel: row.fallbackModel ?? '',
      embeddingProvider: row.embeddingProvider,
      embeddingBaseUrl: row.embeddingBaseUrl,
      embeddingApiKeySet: row.embeddingApiKey.length > 0,
      embeddingModel: row.embeddingModel,
      embeddingDimension: row.embeddingDimension,
    });
  } catch {
    return serverErrorResponse();
  }
}

async function handlePut(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = llmConfigSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors);
    }

    const data = validation.data;
    const now = new Date().toISOString();

    const existingRows = await db.select().from(llmSettings).limit(1);
    const existing = existingRows[0];

    const keepExisting = (incoming: string | undefined, current: string | null | undefined) =>
      incoming && incoming.length > 0 ? incoming : (current ?? '');

    if (existing) {
      await db
        .update(llmSettings)
        .set({
          mainProvider: data.mainProvider,
          mainBaseUrl: data.mainBaseUrl,
          mainApiKey: keepExisting(data.mainApiKey, existing?.mainApiKey),
          mainModel: data.mainModel,
          fallbackProvider: data.fallbackProvider ?? null,
          fallbackBaseUrl: data.fallbackBaseUrl ?? null,
          fallbackApiKey: data.fallbackProvider
            ? keepExisting(data.fallbackApiKey, existing?.fallbackApiKey)
            : null,
          fallbackModel: data.fallbackModel ?? null,
          embeddingProvider: data.embeddingProvider,
          embeddingBaseUrl: data.embeddingBaseUrl,
          embeddingApiKey: keepExisting(data.embeddingApiKey, existing?.embeddingApiKey),
          embeddingModel: data.embeddingModel,
          embeddingDimension: data.embeddingDimension ?? 1536,
          updatedAt: now,
        })
        .where(eq(llmSettings.id, existing.id));
      return successResponse({ id: existing.id }, 'LLM config updated');
    }

    const newId = createId();
    await db.insert(llmSettings).values({
      id: newId,
      mainProvider: data.mainProvider,
      mainBaseUrl: data.mainBaseUrl,
      mainApiKey: data.mainApiKey,
      mainModel: data.mainModel,
      fallbackProvider: data.fallbackProvider ?? null,
      fallbackBaseUrl: data.fallbackBaseUrl ?? null,
      fallbackApiKey: data.fallbackApiKey ?? null,
      fallbackModel: data.fallbackModel ?? null,
      embeddingProvider: data.embeddingProvider,
      embeddingBaseUrl: data.embeddingBaseUrl,
      embeddingApiKey: data.embeddingApiKey,
      embeddingModel: data.embeddingModel,
      embeddingDimension: data.embeddingDimension ?? 1536,
      createdAt: now,
      updatedAt: now,
    });

    return successResponse({ id: newId }, 'LLM config created');
  } catch {
    return serverErrorResponse();
  }
}

export const GET = withAdminAuth(handleGet);
export const PUT = withAdminAuth(handlePut);
