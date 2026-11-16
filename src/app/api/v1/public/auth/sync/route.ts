import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  successResponse,
  serverErrorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from '@/lib/api/responses';
import { getSubmissionContext } from '@/lib/api/submission-context';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/services/rate-limiter';
import { verifyGuestbookToken } from '@/lib/guestbook-token';
import { z } from 'zod';

const syncUserSchema = z.object({
  guestbookToken: z.string().min(1, 'Missing guestbook token').max(4096),
});

const RATE_LIMIT_CONFIG = {
  maxRequests: 10,
  windowMs: 5 * 60 * 1000,
};

export async function POST(request: NextRequest) {
  try {
    const submissionContext = getSubmissionContext(request);
    const rateLimitResult = checkRateLimit(
      `public-auth-sync:${submissionContext.ipHash}`,
      RATE_LIMIT_CONFIG
    );
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        {
          success: false,
          error: {
            message: 'Too many requests. Please try again later.',
            code: 'RATE_LIMITED',
          },
        },
        { status: 429 }
      );

      Object.entries(rateLimitHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    }

    const body = await request.json();
    const parsed = syncUserSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }

    const identity = await verifyGuestbookToken(parsed.data.guestbookToken);
    if (!identity) {
      const response = unauthorizedResponse('Guestbook sign-in expired. Please sign in again.');
      Object.entries(rateLimitHeaders).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    const [user] = await db
      .select({ id: users.id, email: users.email, name: users.name, image: users.image })
      .from(users)
      .where(eq(users.id, identity.sub))
      .limit(1);

    if (!user) {
      const response = unauthorizedResponse('User not found. Please sign in again.');
      Object.entries(rateLimitHeaders).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    const response = successResponse(user, 'User synced successfully');

    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch {
    return serverErrorResponse();
  }
}
