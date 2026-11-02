import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { anonymousMessagesService } from '@/lib/api/handlers/anonymous-messages.service';
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { updateReadStatusSchema } from '@/lib/validations/anonymous-message.schema';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id } = await context.params;
      const body = await req.json();
      const validation = updateReadStatusSchema.safeParse(body);

      if (!validation.success) {
        return validationErrorResponse(validation.error.format());
      }

      const exists = await anonymousMessagesService.getById(id);
      if (!exists) {
        return notFoundResponse('Message');
      }

      const message = validation.data.read
        ? await anonymousMessagesService.markAsRead(id)
        : await anonymousMessagesService.markAsUnread(id);

      return successResponse(message, 'Message updated successfully');
    } catch {
      return serverErrorResponse();
    }
  })(req);
}
