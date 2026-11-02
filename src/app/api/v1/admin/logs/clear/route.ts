import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import {
  serverErrorResponse,
  successResponse,
  validationErrorResponse,
} from '@/lib/api/responses';
import { logQueryService } from '@/lib/services/logQuery.service';
import { logClearSchema } from '@/lib/validations/log-clear.schema';
import { subtractDaysFromNow } from '@/lib/utils/date';

async function handlePost(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const validation = logClearSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const { levels } = validation.data;
    const cutoff =
      validation.data.mode === 'last-n-days'
        ? subtractDaysFromNow(validation.data.days)
        : validation.data.mode === 'before-date'
          ? new Date(validation.data.beforeDate)
          : undefined;

    const deletedCount = await logQueryService.clear({
      ...(cutoff === undefined ? {} : { cutoff }),
      ...(levels === undefined ? {} : { levels }),
    });

    return successResponse(
      { deletedCount, cutoff: cutoff?.toISOString() ?? null },
      `Cleared ${deletedCount} log${deletedCount === 1 ? '' : 's'}`
    );
  } catch {
    return serverErrorResponse('Failed to clear logs');
  }
}

export const POST = withAdminAuth(handlePost);
