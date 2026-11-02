import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
  errorResponse,
} from '@/lib/api/responses';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/services/rate-limiter';
import {
  RAG_SERVICE_TOKEN_HEADER,
  isRagServiceTokenValid,
  validateTurnstileToken,
} from '@/lib/services/turnstile';
import { createId } from '@paralleldrive/cuid2';
import { getSubmissionContext } from '@/lib/api/submission-context';
import { anonymousMessagesService } from '@/lib/api/handlers/anonymous-messages.service';
import { notificationService } from '@/lib/services/notificationService';

const publicMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message is required')
    .max(500, 'Message must be 500 characters or less'),
  turnstileToken: z.string().optional(),
});

const RATE_LIMIT_CONFIG = {
  maxRequests: 5,
  windowMs: 60 * 1000,
};

export async function POST(request: NextRequest) {
  try {
    const submissionContext = getSubmissionContext(request);

    const rateLimitResult = checkRateLimit(
      `messages:${submissionContext.ipHash}`,
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
    const parsed = publicMessageSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }

    const { content, turnstileToken } = parsed.data;

    const serviceTokenHeader = request.headers.get(RAG_SERVICE_TOKEN_HEADER);
    const bypassTurnstile = isRagServiceTokenValid(serviceTokenHeader);

    const turnstileValidation = bypassTurnstile
      ? { success: true as const }
      : await validateTurnstileToken({
          token: turnstileToken,
          expectedAction: 'ngl-message',
          remoteIp: submissionContext.ipAddress ?? undefined,
        });
    if (!turnstileValidation.success) {
      return errorResponse(
        turnstileValidation.message ?? 'CAPTCHA verification failed. Please try again.',
        turnstileValidation.status ?? 400,
        turnstileValidation.code ?? 'TURNSTILE_VERIFICATION_FAILED'
      );
    }

    const now = new Date().toISOString();
    const messageData = {
      id: createId(),
      content,
      ipHash: submissionContext.ipHash,
      ipAddress: submissionContext.ipAddress,
      countryCode: submissionContext.countryCode,
      country: submissionContext.country,
      city: submissionContext.city,
      region: submissionContext.region,
      metadata: submissionContext.metadata,
      read: false,
      createdAt: now,
      updatedAt: now,
    };

    await anonymousMessagesService.create(messageData);

    void notificationService.enqueue('message.created', {
      content: messageData.content,
      createdAt: messageData.createdAt,
    });

    const response = successResponse({ success: true }, 'Message sent successfully');

    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON body', 400);
    }
    return serverErrorResponse();
  }
}
