interface Env {
  MEDIA: R2Bucket;
}

const PUBLIC_FOLDERS = new Set(['about', 'projects', 'achievements']);
const PUBLIC_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

function errorResponse(status: number): Response {
  return new Response(null, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return errorResponse(405);
    }

    let key: string;
    try {
      key = decodeURIComponent(new URL(request.url).pathname.slice(1));
    } catch {
      return errorResponse(400);
    }

    const segments = key.split('/');
    if (
      !key ||
      key.includes('\\') ||
      segments.length < 2 ||
      !PUBLIC_FOLDERS.has(segments[0]) ||
      segments.some((segment) => !segment || segment === '.' || segment === '..')
    ) {
      return errorResponse(404);
    }

    const object = request.method === 'HEAD'
      ? await env.MEDIA.head(key)
      : await env.MEDIA.get(key, request.headers.has('range') ? { range: request.headers } : undefined);

    if (!object) return errorResponse(404);

    const contentType = object.httpMetadata?.contentType?.toLowerCase() ?? '';
    if (!PUBLIC_IMAGE_TYPES.has(contentType)) return errorResponse(404);

    const headers = new Headers({
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });
    object.writeHttpMetadata(headers);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
    headers.set('Accept-Ranges', 'bytes');

    if (request.method === 'HEAD') {
      headers.set('Content-Length', String(object.size));
      return new Response(null, { headers });
    }

    if (object.range) {
      const { offset, length } = object.range;
      headers.set('Content-Range', `bytes ${offset}-${offset + length - 1}/${object.size}`);
      headers.set('Content-Length', String(length));
      return new Response(object.body, { status: 206, headers });
    }

    headers.set('Content-Length', String(object.size));
    return new Response(object.body, { headers });
  },
};
