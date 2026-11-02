import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSubmissionContext } from '@/lib/api/submission-context';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/services/rate-limiter';

type RagChatPath = 'chat' | 'chat/confirm';

const RATE_LIMITS: Record<RagChatPath, { maxRequests: number; windowMs: number }> = {
  chat: { maxRequests: 12, windowMs: 60_000 },
  'chat/confirm': { maxRequests: 6, windowMs: 60_000 },
};

const MAX_REQUEST_BYTES = 16 * 1024;
const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL?.trim() || 'http://localhost:3005';
const RAG_SERVICE_TOKEN =
  process.env.RAG_INGEST_SERVICE_TOKEN?.trim() || process.env.ADMIN_SERVICE_TOKEN?.trim() || '';

function jsonError(message: string, status: number, code: string, headers?: Record<string, string>) {
  const response = NextResponse.json(
    { success: false, error: { message, code } },
    { status },
  );

  for (const [name, value] of Object.entries(headers ?? {})) {
    response.headers.set(name, value);
  }

  return response;
}

async function readBoundedBody(request: Request): Promise<string | null> {
  const reader = request.body?.getReader();
  if (!reader) return '';

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalBytes += value.byteLength;
    if (totalBytes > MAX_REQUEST_BYTES) {
      await reader.cancel();
      return null;
    }

    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(body);
}

export async function proxyRagChatRequest(request: NextRequest, path: RagChatPath) {
  const submissionContext = getSubmissionContext(request);
  const rateLimit = checkRateLimit(
    `public-rag-${path}:${submissionContext.ipHash}`,
    RATE_LIMITS[path],
  );
  const rateLimitHeaders = getRateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    return jsonError(
      path === 'chat'
        ? 'Too many chat requests. Please wait a minute before trying again.'
        : 'Too many confirmation requests. Please wait a minute before trying again.',
      429,
      'RATE_LIMITED',
      rateLimitHeaders,
    );
  }

  if (!RAG_SERVICE_TOKEN) {
    return jsonError('Chat service is temporarily unavailable.', 503, 'RAG_SERVICE_UNAVAILABLE', rateLimitHeaders);
  }

  let body: string | null;
  try {
    body = await readBoundedBody(request);
  } catch {
    return jsonError('Invalid request body.', 400, 'INVALID_CHAT_REQUEST', rateLimitHeaders);
  }

  if (body === null) {
    return jsonError('Request body is too large.', 413, 'REQUEST_TOO_LARGE', rateLimitHeaders);
  }

  try {
    const baseUrl = new URL(RAG_SERVICE_URL);
    const endpoint = path === 'chat' ? '/chat' : '/chat/confirm';
    const headers = new Headers({
      'Content-Type': request.headers.get('content-type') || 'application/json',
      'X-Service-Token': RAG_SERVICE_TOKEN,
    });

    const acceptLanguage = request.headers.get('accept-language')?.slice(0, 255);
    if (acceptLanguage) headers.set('Accept-Language', acceptLanguage);
    if (submissionContext.ipAddress) headers.set('X-Forwarded-For', submissionContext.ipAddress);

    const upstream = await fetch(new URL(endpoint, baseUrl), {
      method: 'POST',
      headers,
      body,
      signal: request.signal,
    });
    const response = new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
      },
    });

    for (const [name, value] of Object.entries(rateLimitHeaders)) {
      response.headers.set(name, value);
    }

    return response;
  } catch {
    return jsonError('Chat service is temporarily unavailable.', 502, 'RAG_SERVICE_UNAVAILABLE', rateLimitHeaders);
  }
}
