import { NextRequest } from 'next/server';
import { withAdminAuthContext } from '@/lib/api/middleware/auth';
import { knowledgeDocsService } from '@/lib/api/handlers/knowledge-docs.service';
import {
  successResponse,
  validationErrorResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { updateKnowledgeDocSchema } from '@/lib/validations/knowledge.schema';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function handleGet(_req: NextRequest, context: RouteContext) {
  try {
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

async function handlePut(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const validation = updateKnowledgeDocSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const existing = await knowledgeDocsService.getById(id);
    if (!existing) {
      return notFoundResponse('Knowledge document');
    }

    if (validation.data.filename && validation.data.filename !== existing.filename) {
      const duplicate = await knowledgeDocsService.getByFilename(validation.data.filename);
      if (duplicate) {
        return validationErrorResponse({ filename: { _errors: ['Filename already exists'] } });
      }
    }

    const doc = await knowledgeDocsService.update(id, validation.data);
    return successResponse(doc, 'Knowledge document updated');
  } catch {
    return serverErrorResponse('Failed to update knowledge document');
  }
}

async function handleDelete(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await knowledgeDocsService.getById(id);

    if (!existing) {
      return notFoundResponse('Knowledge document');
    }

    await knowledgeDocsService.delete(id);
    return successResponse({ success: true }, 'Knowledge document deleted');
  } catch {
    return serverErrorResponse('Failed to delete knowledge document');
  }
}

export const GET = withAdminAuthContext(handleGet);
export const PUT = withAdminAuthContext(handlePut);
export const DELETE = withAdminAuthContext(handleDelete);
