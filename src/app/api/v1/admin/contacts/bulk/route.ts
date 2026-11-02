import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { contactsService } from '@/lib/api/handlers/contacts.service';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { bulkContactActionSchema } from '@/lib/validations/contact.schema';

async function handlePatch(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = bulkContactActionSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const { ids, action } = validation.data;

    let result;
    switch (action) {
      case 'markRead':
        result = await contactsService.bulkMarkAsRead(ids);
        break;
      case 'markUnread':
        result = await contactsService.bulkMarkAsUnread(ids);
        break;
      case 'delete':
        result = await contactsService.bulkDelete(ids);
        break;
      default:
        return errorResponse('Invalid action', 400, 'INVALID_ACTION');
    }

    return successResponse(
      { updated: result.length },
      `Bulk action "${action}" completed successfully`
    );
  } catch {
    return serverErrorResponse();
  }
}

export const PATCH = withAdminAuth(handlePatch);
