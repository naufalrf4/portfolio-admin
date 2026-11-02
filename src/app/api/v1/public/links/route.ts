import { successResponse, serverErrorResponse } from '@/lib/api/responses';
import { profileLinksService } from '@/lib/api/handlers/profile-links.service';

export async function GET() {
  try {
    const links = await profileLinksService.getAll({ visible: true });

    return successResponse(links);
  } catch {
    return serverErrorResponse();
  }
}
