import { NextRequest } from 'next/server';
import { successResponse, serverErrorResponse } from '@/lib/api/responses';
import { db } from '@/lib/db';
import { blogLink } from '@/lib/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { signAssetUrlsMany } from '@/lib/utils/sign-urls';

const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 50;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limitParam = searchParams.get('limit');
    const limit = limitParam
      ? Math.min(Math.max(1, parseInt(limitParam, 10) || DEFAULT_LIMIT), MAX_LIMIT)
      : DEFAULT_LIMIT;

    const [blogs, [{ total }]] = await Promise.all([
      db
        .select({
          id: blogLink.id,
          url: blogLink.url,
          title: blogLink.title,
          description: blogLink.description,
          imageUrl: blogLink.imageUrl,
          source: blogLink.source,
          category: blogLink.category,
          publishedAt: blogLink.publishedAt,
        })
        .from(blogLink)
        .where(eq(blogLink.visible, true))
        .orderBy(desc(blogLink.publishedAt), desc(blogLink.createdAt))
        .limit(limit),
      db.select({ total: count() }).from(blogLink).where(eq(blogLink.visible, true)),
    ]);

    const signedBlogs = await signAssetUrlsMany(blogs, {
      fields: ['imageUrl'],
    });

    return successResponse({ blogs: signedBlogs, meta: { total } });
  } catch {
    return serverErrorResponse();
  }
}
