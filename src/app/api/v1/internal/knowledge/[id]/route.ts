import { NextRequest } from 'next/server';
import { knowledgeDocsService } from '@/lib/api/handlers/knowledge-docs.service';
import { successResponse, notFoundResponse, serverErrorResponse } from '@/lib/api/responses';
import { withServiceAuth } from '@/lib/api/middleware/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withServiceAuth<RouteContext>(
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

      return successResponse(doc);
    } catch {
      return serverErrorResponse('Failed to fetch knowledge document');
    }
  }
);
