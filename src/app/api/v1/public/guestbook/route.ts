import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { guestbookService } from '@/lib/api/handlers/guestbook.service';
import {
  successResponse,
  serverErrorResponse,
  unauthorizedResponse,
  validationErrorResponse,
  errorResponse,
} from '@/lib/api/responses';
import { z } from 'zod';
import { validateTurnstileToken } from '@/lib/services/turnstile';
import { getSubmissionContext } from '@/lib/api/submission-context';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/services/rate-limiter';
import { verifyGuestbookToken } from '@/lib/guestbook-token';
import { notificationService } from '@/lib/services/notificationService';

const createGuestbookEntrySchema = z.object({
  message: z
    .string()
    .min(1, 'Message is required')
    .max(500, 'Message must be 500 characters or less'),
  guestbookToken: z.string().min(1, 'Missing guestbook token'),
  turnstileToken: z.string().optional(),
});

const RATE_LIMIT_CONFIG = {
  maxRequests: 5,
  windowMs: 5 * 60 * 1000,
};

export async function GET() {
  try {
    const entries = await guestbookService.getAll({ visible: true });

    const formattedEntries = entries.map((entry) => ({
      id: entry.id,
      message: entry.message,
      createdAt: entry.createdAt,
      user: {
        name: entry.user.name,
        image: entry.user.image,
      },
    }));

    return successResponse({ entries: formattedEntries });
  } catch {
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const submissionContext = getSubmissionContext(request);
    const rateLimitResult = checkRateLimit(
      `guestbook:${submissionContext.ipHash}`,
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
    const parsed = createGuestbookEntrySchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }

    const { message, guestbookToken, turnstileToken } = parsed.data;

    const turnstileValidation = await validateTurnstileToken({
      token: turnstileToken,
      expectedAction: 'guestbook',
      remoteIp: submissionContext.ipAddress ?? undefined,
    });
    if (!turnstileValidation.success) {
      const response = errorResponse(
        turnstileValidation.message ?? 'CAPTCHA verification failed. Please try again.',
        turnstileValidation.status ?? 400,
        turnstileValidation.code ?? 'TURNSTILE_VERIFICATION_FAILED'
      );

      Object.entries(rateLimitHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    }

    const guestbookIdentity = await verifyGuestbookToken(guestbookToken);

    if (!guestbookIdentity) {
      const response = unauthorizedResponse('Guestbook sign-in expired. Please sign in again.');

      Object.entries(rateLimitHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    }

    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, guestbookIdentity.sub))
      .limit(1);

    const user = userResult[0];

    if (!user) {
      const response = unauthorizedResponse('User not found. Please sign in again.');

      Object.entries(rateLimitHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    }

    const locationData = {
      ipHash: submissionContext.ipHash,
      ipAddress: submissionContext.ipAddress ?? undefined,
      countryCode: submissionContext.countryCode ?? undefined,
      country: submissionContext.country ?? undefined,
      city: submissionContext.city ?? undefined,
      region: submissionContext.region ?? undefined,
      metadata: { ...submissionContext.metadata },
    };

    const entry = await guestbookService.create(user.id, message, locationData);
    if (!entry) {
      return serverErrorResponse();
    }

    void notificationService.enqueue('guestbook.created', {
      name: entry.user.name,
      message: entry.message,
      createdAt: entry.createdAt,
    });

    const response = successResponse(entry, 'Entry added successfully');

    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch {
    return serverErrorResponse();
  }
}
