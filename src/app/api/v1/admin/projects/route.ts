import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { projectsService } from '@/lib/api/handlers/projects.service';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { projectQuerySchema, createProjectSchema } from '@/lib/validations/project.schema';
import { logger } from '@/lib/utils/logger';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { signAssetUrlsMany, signAssetUrls } from '@/lib/utils/sign-urls';
import { queueRagIngest } from '@/lib/services/ragIngest';

async function handleGet(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validation = projectQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    logger.info('Fetching projects', { requestId, operation: 'projects.getAll' });
    const result = await projectsService.getAll(validation.data);

    const signedProjects = await signAssetUrlsMany(result.projects, {
      fields: ['imageUrl'],
    });

    logger.info('Projects fetched successfully', {
      requestId,
      count: result.projects?.length || 0,
      operation: 'projects.getAll',
    });

    return successResponse({ ...result, projects: signedProjects });
  } catch (error) {
    return handleApiError(error, {
      operation: 'admin.projects.getAll',
      requestId,
      metadata: { query: req.url },
    });
  }
}

async function handlePost(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const body = await req.json();
    const validation = createProjectSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    const slugExists = await projectsService.checkSlugExists(validation.data.slug);
    if (slugExists) {
      return errorResponse('Project with this slug already exists', 409, 'SLUG_EXISTS');
    }

    logger.info('Creating project', {
      requestId,
      operation: 'projects.create',
      slug: validation.data.slug,
    });
    const project = await projectsService.create(validation.data);
    if (!project) {
      return serverErrorResponse();
    }
    const signedProject = await signAssetUrls(project, {
      fields: ['imageUrl'],
    });

    logger.info('Project created successfully', {
      requestId,
      operation: 'projects.create',
      projectId: project.id,
    });

    if (project.visible) {
      queueRagIngest({ type: 'project', documentId: project.slug });
    }

    return successResponse(signedProject, 'Project created successfully');
  } catch (error) {
    return handleApiError(error, {
      operation: 'admin.projects.create',
      requestId,
    });
  }
}

export const GET = withAdminAuth(handleGet);
export const POST = withAdminAuth(handlePost);
