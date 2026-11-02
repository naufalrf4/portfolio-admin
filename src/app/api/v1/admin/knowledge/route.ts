import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { knowledgeDocsService } from '@/lib/api/handlers/knowledge-docs.service';
import { successResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api/responses';
import {
  knowledgeDocQuerySchema,
  createKnowledgeDocSchema,
} from '@/lib/validations/knowledge.schema';

async function handleGet(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validation = knowledgeDocQuerySchema.safeParse(queryParams);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const result = await knowledgeDocsService.getAll(validation.data);
    return successResponse(result);
  } catch {
    return serverErrorResponse('Failed to fetch knowledge documents');
  }
}

async function handlePost(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = createKnowledgeDocSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const existing = await knowledgeDocsService.getByFilename(validation.data.filename);
    if (existing) {
      return validationErrorResponse({ filename: { _errors: ['Filename already exists'] } });
    }

    const doc = await knowledgeDocsService.create(validation.data);
    return successResponse(doc, 'Knowledge document created');
  } catch {
    return serverErrorResponse('Failed to create knowledge document');
  }
}

export const GET = withAdminAuth(handleGet);
export const POST = withAdminAuth(handlePost);
