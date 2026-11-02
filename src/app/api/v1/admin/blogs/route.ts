import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { publicationLinksService } from '@/lib/api/handlers/publication-links.service';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/responses';
import { createBlogLinkSchema } from '@/lib/validations/blog-link.schema';
import { z } from 'zod';
import { logger } from '@/lib/utils/logger';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { signAssetUrlsMany, signAssetUrls } from '@/lib/utils/sign-urls';
import { queueRagIngest } from '@/lib/services/ragIngest';

const querySchema = z.object({
  source: z.string().optional(),
  visible: z.coerce.boolean().optional(),
});

async function handleGet(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validation = querySchema.safeParse(queryParams);
    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

    logger.info('Fetching blog links', { requestId, operation: 'blogs.getAll' });
  const blogLinks = await publicationLinksService.getAll(validation.data);

    const signedBlogs = await signAssetUrlsMany(blogLinks, {
      fields: ['imageUrl'],
    });

    logger.info('Blog links fetched successfully', {
      requestId,
      count: blogLinks?.length || 0,
      operation: 'blogs.getAll',
    });

    return successResponse({ blogLinks: signedBlogs });
  } catch (error) {
    return handleApiError(error, {
      operation: 'admin.blogs.getAll',
      requestId,
      metadata: { query: req.url },
    });
  }
}

async function handlePost(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const body = await req.json();
    const validation = createBlogLinkSchema.safeParse(body);

    if (!validation.success) {
      return validationErrorResponse(validation.error.format());
    }

  const existingBlogLink = await publicationLinksService.getAll({ visible: undefined });
    const urlExists = existingBlogLink.some((blog) => blog.url === validation.data.url);

    if (urlExists) {
      return errorResponse('Blog link with this URL already exists', 409, 'URL_EXISTS');
    }

    logger.info('Creating blog link', {
      requestId,
      operation: 'blogs.create',
      url: validation.data.url,
    });
  const blogLink = await publicationLinksService.create(validation.data);

    const signedBlog = await signAssetUrls(blogLink, {
      fields: ['imageUrl'],
    });

    logger.info('Blog link created successfully', {
      requestId,
      operation: 'blogs.create',
      blogId: blogLink.id,
    });

    if (blogLink.visible) {
      queueRagIngest({ type: 'blog', documentId: blogLink.id });
    }

    return successResponse(signedBlog, 'Blog link created successfully');
  } catch (error) {
    return handleApiError(error, {
      operation: 'admin.blogs.create',
      requestId,
    });
  }
}

export const GET = withAdminAuth(handleGet);
export const POST = withAdminAuth(handlePost);
