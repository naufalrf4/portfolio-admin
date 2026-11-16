import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { anonymousMessagesService } from '@/lib/api/handlers/anonymous-messages.service';
import { successResponse, serverErrorResponse, validationErrorResponse, errorResponse } from '@/lib/api/responses';
import { createAnonymousMessageSchema } from '@/lib/validations/anonymous-message.schema';
import { getIpLocation } from '@/lib/services/geoIpService';
import { createId } from '@paralleldrive/cuid2';

type AnonymousMessageCreateInput = Parameters<typeof anonymousMessagesService.create>[0];

async function handleGet(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const readParam = searchParams.get('read');

    const filters = readParam !== null ? { read: readParam === 'true' } : undefined;

    const result = await anonymousMessagesService.getAll(filters);
    return successResponse(result);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON body', 400);
    }
    return serverErrorResponse();
  }
}

async function handlePost(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = createAnonymousMessageSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.flatten().fieldErrors);
    }
    const parsed = validation.data;

    const forwarded = req.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : '0.0.0.0';

    const geoLocation = getIpLocation(clientIp);

    const now = new Date().toISOString();
    const data: AnonymousMessageCreateInput = {
      id: createId(),
      content: parsed.content,
      ipHash: parsed.ipHash || clientIp,
      ipAddress: clientIp,
      read: false,
      createdAt: now,
      updatedAt: now,
    };

    if (geoLocation) {
      if (geoLocation.countryCode) data.countryCode = geoLocation.countryCode;
      if (geoLocation.country) data.country = geoLocation.country;
      if (geoLocation.city) data.city = geoLocation.city;
      if (geoLocation.region) data.region = geoLocation.region;
    }

    const message = await anonymousMessagesService.create({
      ...data,
    });

    return successResponse(message, 'Message sent successfully');
  } catch {
    return serverErrorResponse();
  }
}

export const GET = withAdminAuth(handleGet);
export const POST = withAdminAuth(handlePost);
