import { NextRequest } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { safeAuth } from '@/lib/auth';
import type { Session } from 'next-auth';
import { unauthorizedResponse, forbiddenResponse } from '../responses';
import { logger } from '@/lib/utils/logger';

const ADMIN_INTERNAL_API_TOKEN =
  process.env.ADMIN_INTERNAL_API_TOKEN || process.env.ADMIN_SERVICE_TOKEN;

if (!ADMIN_INTERNAL_API_TOKEN) {
  logger.warn(
    '[auth] Neither ADMIN_INTERNAL_API_TOKEN nor ADMIN_SERVICE_TOKEN is set. ' +
      'All withServiceAuth requests will be rejected until one is configured.'
  );
}

function isServiceTokenValid(provided: string | null): boolean {
  if (!provided || !ADMIN_INTERNAL_API_TOKEN) {
    return false;
  }

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(ADMIN_INTERNAL_API_TOKEN);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

export function withAdminAuth(handler: (req: NextRequest) => Promise<Response>) {
  return async (req: NextRequest) => {
    const session = (await safeAuth()) as Session | null;

    if (!session?.user) {
      return unauthorizedResponse();
    }

    if (session.user.role !== 'ADMIN') {
      return forbiddenResponse('Admin access required');
    }

    return handler(req);
  };
}

export function withAdminAuthContext<T>(
  handler: (req: NextRequest, context: T, session: Session) => Promise<Response>
) {
  return async (req: NextRequest, context: T) => {
    const session = (await safeAuth()) as Session | null;

    if (!session?.user) {
      return unauthorizedResponse();
    }

    if (session.user.role !== 'ADMIN') {
      return forbiddenResponse('Admin access required');
    }

    return handler(req, context, session);
  };
}

export function withServiceAuth<T>(handler: (req: NextRequest, context?: T) => Promise<Response>) {
  return async (req: NextRequest, context?: T) => {
    const token = req.headers.get('X-Service-Token');

    if (!isServiceTokenValid(token)) {
      return unauthorizedResponse('Invalid service token');
    }

    return handler(req, context);
  };
}
