import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { profileLinksService } from '@/lib/api/handlers/profile-links.service';
import { successResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api/responses';
import { reorderProfileLinksSchema } from '@/lib/validations/profile-link.schema';

async function handlePost(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = reorderProfileLinksSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const links = await profileLinksService.reorder(validation.data.linkIds);
    return successResponse(links, 'Profile links reordered successfully');
  } catch {
    return serverErrorResponse();
  }
}

export const POST = withAdminAuth(handlePost);
