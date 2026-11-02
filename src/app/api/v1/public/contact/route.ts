import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  successResponse,
  serverErrorResponse,
  validationErrorResponse,
  errorResponse,
} from '@/lib/api/responses';
import { db } from '@/lib/db';
import { contactForms, contactSettings } from '@/lib/db/schema';
import { z } from 'zod';
import { emailService } from '@/lib/services/emailService';
import { EMAIL_CONFIG } from '@/lib/email/config';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/services/rate-limiter';
import { validateTurnstileToken } from '@/lib/services/turnstile';
import { createId } from '@paralleldrive/cuid2';
import { getSubmissionContext } from '@/lib/api/submission-context';
import { notificationService } from '@/lib/services/notificationService';
import { logger } from '@/lib/utils/logger';

const createContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email').max(255),
  subject: z.string().max(200).optional(),
  message: z.string().min(1, 'Message is required').max(5000),
  turnstileToken: z.string().max(2048).optional(),
});

const RATE_LIMIT_CONFIG = {
  maxRequests: 3,
  windowMs: 5 * 60 * 1000,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createContactSchema.safeParse(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error.flatten().fieldErrors);
    }

    const submissionContext = getSubmissionContext(request);
    const rateLimitResult = checkRateLimit(
      `contact:${submissionContext.ipHash}`,
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

    const turnstileValidation = await validateTurnstileToken({
      token: parsed.data.turnstileToken,
      expectedAction: 'contact',
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

    const now = new Date().toISOString();
    const [contact] = await db
      .insert(contactForms)
      .values({
        id: createId(),
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject || null,
        message: parsed.data.message,
        ipHash: submissionContext.ipHash,
        ipAddress: submissionContext.ipAddress,
        countryCode: submissionContext.countryCode,
        country: submissionContext.country,
        city: submissionContext.city,
        region: submissionContext.region,
        metadata: submissionContext.metadata,
        read: false,
        replied: false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    try {
      await emailService.sendContactConfirmation(parsed.data.email, {
        name: parsed.data.name,
        subject: parsed.data.subject,
        messageId: contact.id,
        receivedAt: new Date().toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'short',
          timeZone: 'Asia/Jakarta',
        }),
      });
    } catch (emailError) {
      logger.error('[Contact API] User confirmation email failed', emailError);
    }

    try {
      const settingsResult = await db.select().from(contactSettings).limit(1);
      const settings = settingsResult[0];

      if (settings?.notificationEmail) {
        await emailService.sendAdminContactNotification(settings.notificationEmail, {
          contact: {
            id: contact.id,
            name: parsed.data.name,
            email: parsed.data.email,
            subject: parsed.data.subject,
            message: parsed.data.message,
            country: submissionContext.country,
            city: submissionContext.city,
          },
          dashboardLink: `${EMAIL_CONFIG.adminDashboardUrl}/contacts/${contact.id}`,
          replyLink: `${EMAIL_CONFIG.adminDashboardUrl}/contacts/${contact.id}`,
          receivedAt: new Date().toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short',
            timeZone: 'Asia/Jakarta',
          }),
        });
      }
    } catch (emailError) {
      logger.error('[Contact API] Admin notification email failed', emailError);
    }

    void notificationService.enqueue('contact.created', {
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      message: contact.message,
      createdAt: contact.createdAt,
    });

    const response = successResponse(
      {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
        createdAt: contact.createdAt,
      },
      'Message sent successfully',
    );

    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch {
    return serverErrorResponse();
  }
}
