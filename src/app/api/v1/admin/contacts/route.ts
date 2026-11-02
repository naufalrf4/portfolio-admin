import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { contactsService } from '@/lib/api/handlers/contacts.service';
import { successResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api/responses';
import { contactQuerySchema, createContactSchema } from '@/lib/validations/contact.schema';

async function handleGet(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validation = contactQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const result = await contactsService.getAll(validation.data);
    return successResponse(result);
  } catch {
    return serverErrorResponse();
  }
}

async function handlePost(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = createContactSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const contact = await contactsService.create(validation.data);
    return successResponse(contact, 'Contact form submitted successfully');
  } catch {
    return serverErrorResponse();
  }
}

export const GET = withAdminAuth(handleGet);
export const POST = withAdminAuth(handlePost);
