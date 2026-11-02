import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { projectsService } from '@/lib/api/handlers/projects.service';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { updateProjectSchema } from '@/lib/validations/project.schema';
import { signAssetUrls } from '@/lib/utils/sign-urls';
import { queueRagIngest } from '@/lib/services/ragIngest';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id } = await context.params;
      const project = await projectsService.getById(id);

      if (!project) {
        return notFoundResponse('Project');
      }

      const signedProject = await signAssetUrls(project, {
        fields: ['imageUrl'],
      });

      return successResponse(signedProject);
    } catch {
      return serverErrorResponse();
    }
  })(req);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id } = await context.params;
      const body = await req.json();
      const validation = updateProjectSchema.safeParse(body);

      if (!validation.success) {
        return validationErrorResponse(validation.error.format());
      }

      const exists = await projectsService.getById(id);
      if (!exists) {
        return notFoundResponse('Project');
      }

      if (validation.data.slug) {
        const slugExists = await projectsService.checkSlugExists(validation.data.slug, id);
        if (slugExists) {
          return errorResponse('Project with this slug already exists', 409, 'SLUG_EXISTS');
        }
      }

      const project = await projectsService.update(id, validation.data);
      if (!project) {
        return serverErrorResponse();
      }
      const signedProject = await signAssetUrls(project, {
        fields: ['imageUrl'],
      });

      if (project.visible) {
        queueRagIngest({ type: 'project', documentId: project.slug });
      }

      return successResponse(signedProject, 'Project updated successfully');
    } catch {
      return serverErrorResponse();
    }
  })(req);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id } = await context.params;
      const exists = await projectsService.getById(id);
      if (!exists) {
        return notFoundResponse('Project');
      }

      await projectsService.delete(id);
      return successResponse(null, 'Project deleted successfully');
    } catch {
      return serverErrorResponse();
    }
  })(req);
}
