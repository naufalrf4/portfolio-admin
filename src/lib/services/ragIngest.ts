import { logger } from '@/lib/utils/logger';

type RagIngestType = 'knowledge' | 'project' | 'blog' | 'about' | 'all';

interface RagIngestRequest {
  type: RagIngestType;
  documentId?: string;
}

export interface RagIngestResult {
  url: string;
  ok: boolean;
  status: number;
  chunksIngested: number;
  payload?: unknown;
  errorMessage?: string;
}

const RAG_INGEST_SERVICE_TOKEN =
  process.env.RAG_INGEST_SERVICE_TOKEN || process.env.ADMIN_SERVICE_TOKEN || '';
const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://localhost:3005';

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function toErrorMessage(payload: unknown, fallbackMessage: string): string {
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'error' in payload &&
    payload.error &&
    typeof payload.error === 'object' &&
    'message' in payload.error &&
    typeof payload.error.message === 'string' &&
    payload.error.message.trim()
  ) {
    return payload.error.message;
  }

  return fallbackMessage;
}

async function parseResponsePayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json().catch(() => null);
  }

  return response.text().catch(() => null);
}

export async function dispatchRagIngest(request: RagIngestRequest): Promise<RagIngestResult> {
  const url = `${normalizeBaseUrl(RAG_SERVICE_URL)}/ingest`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Token': RAG_INGEST_SERVICE_TOKEN,
      },
      body: JSON.stringify(request),
    });

    const payload = await parseResponsePayload(response);
    const chunksIngested =
      payload &&
      typeof payload === 'object' &&
      'data' in payload &&
      payload.data &&
      typeof payload.data === 'object' &&
      'chunksIngested' in payload.data &&
      typeof payload.data.chunksIngested === 'number'
        ? payload.data.chunksIngested
        : 0;

    return {
      url,
      ok: response.ok,
      status: response.status,
      chunksIngested,
      payload,
      errorMessage: response.ok
        ? undefined
        : toErrorMessage(payload, 'RAG ingest failed for FastAPI service'),
    };
  } catch (error) {
    return {
      url,
      ok: false,
      status: 503,
      chunksIngested: 0,
      errorMessage:
        error instanceof Error ? error.message : 'Failed to contact FastAPI RAG service',
    };
  }
}

export function queueRagIngest(request: RagIngestRequest): void {
  void dispatchRagIngest(request)
    .then((result) => {
      if (!result.ok) {
        logger.warn('RAG ingest dispatch failed', {
          operation: 'ragIngest.queue',
          type: request.type,
          documentId: request.documentId,
          status: result.status,
          error: result.errorMessage,
        });
      }
    })
    .catch((error) => {
      logger.warn('RAG ingest dispatch error', {
        operation: 'ragIngest.queue',
        type: request.type,
        documentId: request.documentId,
        error: error instanceof Error ? error.message : String(error),
      });
    });
}
