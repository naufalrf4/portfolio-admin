import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { achievements } from '@/lib/db/schema';
import { eq, count, asc } from 'drizzle-orm';
import { successResponse, serverErrorResponse } from '@/lib/api/responses';
import { toPublicImageUrl } from '@/lib/utils/sign-urls';
import { normalizeStoredAssetValue } from '@/lib/services/storage';
import { logger } from '@/lib/utils/logger';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limitParam = searchParams.get('limit');
    const limit = limitParam
      ? Math.min(Math.max(1, parseInt(limitParam, 10) || DEFAULT_LIMIT), MAX_LIMIT)
      : undefined;

    const achievementsQuery = db
      .select({
        id: achievements.id,
        name: achievements.name,
        location: achievements.location,
        monthYear: achievements.monthYear,
        photos: achievements.photos,
        description: achievements.description,
        externalUrl: achievements.externalUrl,
        order: achievements.order,
        createdAt: achievements.createdAt,
      })
      .from(achievements)
      .where(eq(achievements.visible, true))
      .orderBy(asc(achievements.order));

    const achievementsList = limit ? await achievementsQuery.limit(limit) : await achievementsQuery;

    const [{ total }] = await db
      .select({ total: count() })
      .from(achievements)
      .where(eq(achievements.visible, true));

    const signedAchievements = await Promise.all(
      achievementsList.map(async (achievement) => ({
        ...achievement,
        photos: (achievement.photos || []).flatMap((photo) => {
          const normalized = normalizeStoredAssetValue(photo);
          return normalized ? [toPublicImageUrl(normalized)] : [];
        }),
      }))
    );

    return successResponse({ achievements: signedAchievements, meta: { total } });
  } catch (error) {
    logger.error('Public achievements route failed', error);
    return serverErrorResponse(
      process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    );
  }
}
