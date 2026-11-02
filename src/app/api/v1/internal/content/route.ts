import { NextRequest } from 'next/server';
import { withServiceAuth } from '@/lib/api/middleware/auth';
import { contentExportService } from '@/lib/api/handlers/content-export.service';
import { successResponse, serverErrorResponse } from '@/lib/api/responses';

async function handleGet(_req: NextRequest) {
  try {
    const content = await contentExportService.exportForRAG();
    return successResponse(content);
  } catch {
    return serverErrorResponse('Failed to export content');
  }
}

export const GET = withServiceAuth(handleGet);
