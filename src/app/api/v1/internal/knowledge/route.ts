import { NextRequest } from 'next/server';
import { withServiceAuth } from '@/lib/api/middleware/auth';
import { knowledgeDocsService } from '@/lib/api/handlers/knowledge-docs.service';
import { successResponse, serverErrorResponse } from '@/lib/api/responses';

async function handleGet(_req: NextRequest) {
  try {
    const docs = await knowledgeDocsService.getAllForExport();
    return successResponse(docs);
  } catch {
    return serverErrorResponse('Failed to fetch knowledge docs');
  }
}

export const GET = withServiceAuth(handleGet);
