import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { anonymousMessagesService } from '@/lib/api/handlers/anonymous-messages.service';
import { successResponse, notFoundResponse, serverErrorResponse } from '@/lib/api/responses';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(req: NextRequest, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id } = await context.params;
      const exists = await anonymousMessagesService.getById(id);
      if (!exists) {
        return notFoundResponse('Message');
      }

      await anonymousMessagesService.delete(id);
      return successResponse(null, 'Message deleted successfully');
    } catch {
      return serverErrorResponse();
    }
  })(req);
}
