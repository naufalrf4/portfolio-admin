import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { contactsService } from '@/lib/api/handlers/contacts.service';
import { emailService } from '@/lib/services/emailService';
import { EMAIL_CONFIG } from '@/lib/email/config';
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { updateContactSchema } from '@/lib/validations/contact.schema';
import type { UpdateContactInput } from '@/lib/validations/contact.schema';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id } = await context.params;
      const contact = await contactsService.getById(id);

      if (!contact) {
        return notFoundResponse('Contact');
      }

      if (!contact.read) {
        await contactsService.markAsRead(id);
      }

      return successResponse(contact);
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
      const validation = updateContactSchema.safeParse(body);

      if (!validation.success) {
        return validationErrorResponse(validation.error.format());
      }

      const exists = await contactsService.getById(id);
      if (!exists) {
        return notFoundResponse('Contact');
      }

      let nextMetadata: Record<string, unknown> =
        exists.metadata && typeof exists.metadata === 'object'
          ? { ...(exists.metadata as Record<string, unknown>) }
          : {};

      if (validation.data.replySubject && validation.data.replyMessage) {
        await emailService.sendContactReply(exists.email, {
          name: exists.name,
          replySubject: validation.data.replySubject,
          replyMessage: validation.data.replyMessage,
          originalMessage: exists.message,
          dashboardLink: EMAIL_CONFIG.publicSiteUrl,
        });

        nextMetadata = {
          ...nextMetadata,
          reply: {
            subject: validation.data.replySubject,
            message: validation.data.replyMessage,
            repliedAt: new Date().toISOString(),
          },
        };
      }

      const updatePayload: UpdateContactInput = {
        read: validation.data.read,
        replied: validation.data.replied,
        metadata: validation.data.metadata ?? undefined,
        replySubject: validation.data.replySubject,
        replyMessage: validation.data.replyMessage,
      };

      if (validation.data.replySubject && validation.data.replyMessage) {
        updatePayload.replied = true;
        updatePayload.metadata = nextMetadata;
      }

      const contact = await contactsService.update(id, updatePayload);
      return successResponse(contact, 'Contact updated successfully');
    } catch {
      return serverErrorResponse();
    }
  })(req);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id } = await context.params;
      const exists = await contactsService.getById(id);
      if (!exists) {
        return notFoundResponse('Contact');
      }

      await contactsService.delete(id);
      return successResponse(null, 'Contact deleted successfully');
    } catch {
      return serverErrorResponse();
    }
  })(req);
}
