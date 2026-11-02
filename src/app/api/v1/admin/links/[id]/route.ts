import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { profileLinksService } from '@/lib/api/handlers/profile-links.service';
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { updateProfileLinkSchema } from '@/lib/validations/profile-link.schema';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id } = await context.params;
      const link = await profileLinksService.getById(id);

      if (!link) {
        return notFoundResponse('Profile link');
      }

      return successResponse(link);
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
      const validation = updateProfileLinkSchema.safeParse(body);

      if (!validation.success) {
        return validationErrorResponse(validation.error.format());
      }

      const exists = await profileLinksService.getById(id);
      if (!exists) {
        return notFoundResponse('Profile link');
      }

      const link = await profileLinksService.update(id, validation.data);
      return successResponse(link, 'Profile link updated successfully');
    } catch {
      return serverErrorResponse();
    }
  })(req);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id } = await context.params;
      const exists = await profileLinksService.getById(id);
      if (!exists) {
        return notFoundResponse('Profile link');
      }

      await profileLinksService.delete(id);
      return successResponse(null, 'Profile link deleted successfully');
    } catch {
      return serverErrorResponse();
    }
  })(req);
}
