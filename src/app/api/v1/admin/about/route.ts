import { randomUUID } from 'node:crypto';
import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { aboutService } from '@/lib/api/handlers/about.service';
import { successResponse, validationErrorResponse } from '@/lib/api/responses';
import { updateAboutSchema } from '@/lib/validations/about.schema';
import { logger } from '@/lib/utils/logger';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { signAssetUrls } from '@/lib/utils/sign-urls';

async function handleGet() {
  const requestId = randomUUID();

  try {
    logger.info('Fetching about data', { requestId, operation: 'about.get' });
    const aboutMe = await aboutService.get();

    const signedAbout = await signAssetUrls(aboutMe, {
      fields: ['avatarUrl', 'resumeUrl'],
      nested: {
        experience: ['logoUrl'],
      },
    });

    logger.info('About data fetched successfully', { requestId, operation: 'about.get' });

    return successResponse(signedAbout);
  } catch (error) {
    return handleApiError(error, {
      operation: 'admin.about.get',
      requestId,
    });
  }
}

async function handlePut(req: NextRequest) {
  const requestId = randomUUID();

  try {
    const body = await req.json();
    const validation = updateAboutSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    logger.info('Updating about data', { requestId, operation: 'about.update' });
    const aboutMe = await aboutService.update(validation.data);

    const signedAbout = await signAssetUrls(aboutMe, {
      fields: ['avatarUrl', 'resumeUrl'],
      nested: {
        experience: ['logoUrl'],
      },
    });

    logger.info('About data updated successfully', { requestId, operation: 'about.update' });

    return successResponse(signedAbout, 'About me updated successfully');
  } catch (error) {
    return handleApiError(error, {
      operation: 'admin.about.update',
      requestId,
    });
  }
}

export const GET = withAdminAuth(handleGet);
export const PUT = withAdminAuth(handlePut);
