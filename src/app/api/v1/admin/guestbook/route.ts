import { withAdminAuth } from '@/lib/api/middleware/auth';
import { guestbookService } from '@/lib/api/handlers/guestbook.service';
import { successResponse } from '@/lib/api/responses';
import { logger } from '@/lib/utils/logger';
import { handleApiError } from '@/lib/api/utils/error-handler';

async function handleGet() {
  const requestId = crypto.randomUUID();

  try {
    logger.info('Fetching guestbook entries', { requestId, operation: 'guestbook.getAll' });
    const entries = await guestbookService.getAll();
    logger.info('Guestbook entries fetched successfully', {
      requestId,
      count: entries?.length || 0,
      operation: 'guestbook.getAll',
    });

    return successResponse({ entries });
  } catch (error) {
    return handleApiError(error, {
      operation: 'admin.guestbook.getAll',
      requestId,
    });
  }
}

export const GET = withAdminAuth(handleGet);
