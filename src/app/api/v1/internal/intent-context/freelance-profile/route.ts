import { NextRequest } from 'next/server';
import { withServiceAuth } from '@/lib/api/middleware/auth';
import { contentExportService } from '@/lib/api/handlers/content-export.service';
import { serverErrorResponse, successResponse } from '@/lib/api/responses';

async function handleGet(_req: NextRequest) {
  try {
    const context = await contentExportService.exportFreelanceProfileIntentContext();
    return successResponse(context);
  } catch {
    return serverErrorResponse('Failed to export freelance intent context');
  }
}

export const GET = withServiceAuth(handleGet);
