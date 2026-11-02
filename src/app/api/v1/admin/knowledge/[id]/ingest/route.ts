import { NextRequest } from 'next/server';
import { withAdminAuthContext } from '@/lib/api/middleware/auth';
import { knowledgeDocsService } from '@/lib/api/handlers/knowledge-docs.service';
import { dispatchRagIngest } from '@/lib/services/ragIngest';
import {
  errorResponse,
  notFoundResponse,
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function handlePost(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const doc = await knowledgeDocsService.getById(id);

    if (!doc) {
      return notFoundResponse('Knowledge document');
    }

    const result = await dispatchRagIngest({
      type: 'knowledge',
      documentId: id,
    });

    if (!result.ok) {
      return errorResponse(
        result.errorMessage || 'Failed to trigger knowledge ingestion',
        result.status,
        'RAG_INGEST_FAILED',
        {
          ingest: result,
        }
      );
    }

    return successResponse(
      {
        success: true,
        chunksIngested: result.chunksIngested,
        target: 'rag-service',
      },
      'Document ingested successfully'
    );
  } catch (error) {
    return serverErrorResponse(`Failed to trigger ingestion: ${error}`);
  }
}

export const POST = withAdminAuthContext(handlePost);
