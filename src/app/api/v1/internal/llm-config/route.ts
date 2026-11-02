import { NextRequest } from 'next/server';
import { withServiceAuth } from '@/lib/api/middleware/auth';
import { db } from '@/lib/db';
import { llmSettings } from '@/lib/db/schema';
import { successResponse, serverErrorResponse } from '@/lib/api/responses';

async function handleGet(_req: NextRequest) {
  try {
    const rows = await db.select().from(llmSettings).limit(1);
    const row = rows[0];

    if (!row) {
      return successResponse(null, 'No LLM config found');
    }

    return successResponse({
      main: {
        provider: row.mainProvider,
        baseUrl: row.mainBaseUrl,
        apiKey: row.mainApiKey,
        model: row.mainModel,
      },
      fallback: row.fallbackProvider
        ? {
            provider: row.fallbackProvider,
            baseUrl: row.fallbackBaseUrl ?? '',
            apiKey: row.fallbackApiKey ?? '',
            model: row.fallbackModel ?? '',
          }
        : null,
      embedding: {
        provider: row.embeddingProvider,
        baseUrl: row.embeddingBaseUrl,
        apiKey: row.embeddingApiKey,
        model: row.embeddingModel,
      },
      embeddingDimension: row.embeddingDimension,
    });
  } catch {
    return serverErrorResponse('Failed to read LLM config');
  }
}

export const GET = withServiceAuth(handleGet);
