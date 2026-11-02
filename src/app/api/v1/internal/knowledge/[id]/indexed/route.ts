import { NextRequest } from 'next/server';
import { knowledgeDocsService } from '@/lib/api/handlers/knowledge-docs.service';
import { successResponse, notFoundResponse, serverErrorResponse } from '@/lib/api/responses';
import { withServiceAuth } from '@/lib/api/middleware/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const PATCH = withServiceAuth<RouteContext>(
  async (_req: NextRequest, context?: RouteContext) => {
    try {
      if (!context) {
        return serverErrorResponse('Missing route context');
      }

      const { id } = await context.params;
      const doc = await knowledgeDocsService.getById(id);

      if (!doc) {
        return notFoundResponse('Knowledge document');
      }

      await knowledgeDocsService.markIndexed(id);
      return successResponse({ success: true });
    } catch {
      return serverErrorResponse('Failed to mark document as indexed');
    }
  }
);
