import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { successResponse, serverErrorResponse } from '@/lib/api/responses';
import { db } from '@/lib/db';
import { anonymousMessages } from '@/lib/db/schema';
import { isNotNull } from 'drizzle-orm';

interface LocationStat {
  countryCode: string;
  count: number;
}

async function handleGet(_req: NextRequest) {
  try {
    const messages = await db
      .select({ countryCode: anonymousMessages.countryCode })
      .from(anonymousMessages)
      .where(isNotNull(anonymousMessages.countryCode));

    const locationStats = messages.reduce(
      (acc, message) => {
        const code = message.countryCode as string;
        acc[code] = (acc[code] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const result = Object.entries(locationStats)
      .map(
        ([countryCode, count]) =>
          ({
            countryCode,
            count,
          }) as LocationStat
      )
      .sort((a, b) => b.count - a.count);

    return successResponse(result);
  } catch {
    return serverErrorResponse();
  }
}

export const GET = withAdminAuth(handleGet);
