import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { publicationLinksService } from '@/lib/api/handlers/publication-links.service';
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { updateBlogLinkSchema } from '@/lib/validations/blog-link.schema';
import { queueRagIngest } from '@/lib/services/ragIngest';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id } = await context.params;
  const blogLink = await publicationLinksService.getById(id);

      if (!blogLink) {
        return notFoundResponse('Blog link');
      }

      return successResponse(blogLink);
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
      const validation = updateBlogLinkSchema.safeParse(body);

      if (!validation.success) {
        return validationErrorResponse(validation.error.format());
      }

  const exists = await publicationLinksService.getById(id);
      if (!exists) {
        return notFoundResponse('Blog link');
      }

  const blogLink = await publicationLinksService.update(id, validation.data);
      if (blogLink?.visible) {
        queueRagIngest({ type: 'blog', documentId: id });
      }
      return successResponse(blogLink, 'Blog link updated successfully');
    } catch {
      return serverErrorResponse();
    }
  })(req);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id } = await context.params;
  const exists = await publicationLinksService.getById(id);
      if (!exists) {
        return notFoundResponse('Blog link');
      }

  await publicationLinksService.delete(id);
      return successResponse(null, 'Blog link deleted successfully');
    } catch {
      return serverErrorResponse();
    }
  })(req);
}
