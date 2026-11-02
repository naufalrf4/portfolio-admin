import { NextRequest, NextResponse } from 'next/server';
import { successResponse, serverErrorResponse, validationErrorResponse } from '@/lib/api/responses';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/services/rate-limiter';
import { analyticsService } from '@/lib/api/handlers/analytics.service';
import { getSubmissionContext } from '@/lib/api/submission-context';
import { publicAnalyticsEventSchema } from '@/lib/validations/analytics.schema';

const RATE_LIMIT_CONFIG = {
  maxRequests: 60,
  windowMs: 60 * 1000,
};

export async function POST(request: NextRequest) {
  try {
    const submissionContext = getSubmissionContext(request);
    const rateLimitResult = checkRateLimit(
      `public-analytics:${submissionContext.ipHash}`,
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
    const parsed = publicAnalyticsEventSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }

    const event = await analyticsService.trackEvent({
      page: parsed.data.page,
      eventType: parsed.data.eventType,
      entityType: parsed.data.entityType,
      entityId: parsed.data.entityId || null,
      userSession: parsed.data.userSession || null,
      ipAddress: submissionContext.ipAddress,
      countryCode: submissionContext.countryCode,
      city: submissionContext.city,
      data: {
        ...(parsed.data.data || {}),
        sourceApp: submissionContext.metadata.sourceApp,
        sourcePath: submissionContext.metadata.sourcePath,
        referrerDomain: submissionContext.metadata.referrerDomain,
        language: submissionContext.metadata.language,
        country: submissionContext.country,
      },
    });

    const response = successResponse({ id: event.id }, 'Analytics event tracked');

    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch {
    return serverErrorResponse();
  }
}
