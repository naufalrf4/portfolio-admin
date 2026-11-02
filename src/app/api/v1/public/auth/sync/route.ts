import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { successResponse, serverErrorResponse, validationErrorResponse } from '@/lib/api/responses';
import { getSubmissionContext } from '@/lib/api/submission-context';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/services/rate-limiter';
import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';

type UserInsert = typeof users.$inferInsert;
type UserConflictUpdate = Partial<Pick<typeof users.$inferInsert, 'name' | 'image' | 'updatedAt'>>;

const syncUserSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().optional(),
  image: z.string().url().optional().nullable(),
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

    const { email, name, image } = parsed.data;

    const now = new Date().toISOString();
    const userData: UserInsert = {
      id: createId(),
      email,
      name,
      image,
      role: 'USER',
      createdAt: now,
      updatedAt: now,
    };

    const conflictUpdate: UserConflictUpdate = { updatedAt: now };
    if (name) {
      conflictUpdate.name = name;
    }
    if (image) {
      conflictUpdate.image = image;
    }

    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: conflictUpdate,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        image: users.image,
      });

    const response = successResponse(user, 'User synced successfully');

    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch {
    return serverErrorResponse();
  }
}
