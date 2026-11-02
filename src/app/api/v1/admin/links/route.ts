import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { profileLinksService } from '@/lib/api/handlers/profile-links.service';
import { successResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api/responses';
import { createProfileLinkSchema } from '@/lib/validations/profile-link.schema';

async function handleGet() {
  try {
    const links = await profileLinksService.getAll();
    return successResponse(links);
  } catch {
    return serverErrorResponse();
  }
}

async function handlePost(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = createProfileLinkSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const link = await profileLinksService.create(validation.data);
    return successResponse(link, 'Profile link created successfully');
  } catch {
    return serverErrorResponse();
  }
}

export const GET = withAdminAuth(handleGet);
export const POST = withAdminAuth(handlePost);
