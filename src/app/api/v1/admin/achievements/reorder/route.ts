import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { achievementsService } from '@/lib/api/handlers/achievements.service';
import { successResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api/responses';
import { reorderAchievementsSchema } from '@/lib/validations/achievement.schema';

async function handlePost(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = reorderAchievementsSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const achievements = await achievementsService.reorder(validation.data.achievementIds);
    return successResponse({ achievements }, 'Achievements reordered successfully');
  } catch {
    return serverErrorResponse();
  }
}

export const POST = withAdminAuth(handlePost);
