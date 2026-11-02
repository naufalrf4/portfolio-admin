import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { achievementsService } from '@/lib/api/handlers/achievements.service';
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { updateAchievementSchema } from '@/lib/validations/achievement.schema';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id } = await context.params;
      const achievement = await achievementsService.getById(id);

      if (!achievement) {
        return notFoundResponse('Achievement');
      }

      return successResponse(achievement);
    } catch {
      return serverErrorResponse();
    }
  })(req);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id } = await context.params;
      const body = await req.json();
      const validation = updateAchievementSchema.safeParse(body);

      if (!validation.success) {
        return validationErrorResponse(validation.error.format());
      }

      const exists = await achievementsService.getById(id);
      if (!exists) {
        return notFoundResponse('Achievement');
      }

      const achievement = await achievementsService.update(id, validation.data);
      return successResponse(achievement, 'Achievement updated successfully');
    } catch {
      return serverErrorResponse();
    }
  })(req);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id } = await context.params;
      const exists = await achievementsService.getById(id);
      if (!exists) {
        return notFoundResponse('Achievement');
      }

      await achievementsService.delete(id);
      return successResponse(null, 'Achievement deleted successfully');
    } catch {
      return serverErrorResponse();
    }
  })(req);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id } = await context.params;
      const body = await req.json();
      const validation = updateAchievementSchema.safeParse(body);

      if (!validation.success) {
        return validationErrorResponse(validation.error.format());
      }

      const exists = await achievementsService.getById(id);
      if (!exists) {
        return notFoundResponse('Achievement');
      }

      const achievement = await achievementsService.update(id, validation.data);
      return successResponse(achievement, 'Achievement updated successfully');
    } catch {
      return serverErrorResponse();
    }
  })(req);
}
