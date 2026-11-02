import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { guestbookService } from '@/lib/api/handlers/guestbook.service';
import { successResponse, notFoundResponse, serverErrorResponse } from '@/lib/api/responses';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id } = await context.params;
      const entry = await guestbookService.getById(id);

      if (!entry) {
        return notFoundResponse('Guestbook entry');
      }

      const updated = await guestbookService.toggleVisibility(id);
      return successResponse(updated, 'Visibility toggled successfully');
    } catch {
      return serverErrorResponse();
    }
  })(req);
}
