import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { projects, projectImages } from '@/lib/db/schema';
import { eq, and, desc, count, asc } from 'drizzle-orm';
import { successResponse, serverErrorResponse } from '@/lib/api/responses';
import { mapPublicImageUrls } from '@/lib/utils/sign-urls';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const featured = searchParams.get('featured') === 'true' ? true : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const category = searchParams.get('category') || undefined;

    const where = and(
      eq(projects.visible, true),
      featured !== undefined ? eq(projects.featured, featured) : undefined,
      category ? eq(projects.category, category) : undefined
    );

    const featuredWhere = and(eq(projects.visible, true), eq(projects.featured, true));

    const projectsQuery = db
      .select({
        id: projects.id,
        title: projects.title,
        slug: projects.slug,
        summary: projects.summary,
        category: projects.category,
        techStack: projects.techStack,
        liveUrl: projects.liveUrl,
        repoUrl: projects.repoUrl,
        imageUrl: projects.imageUrl,
        featured: projects.featured,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .where(where)
      .orderBy(desc(projects.featured), desc(projects.createdAt));

    const [projectsList, [{ total }], [{ featured: featuredCount }]] = await Promise.all([
      limit ? projectsQuery.limit(limit) : projectsQuery,
      db.select({ total: count() }).from(projects).where(where),
      db.select({ featured: count() }).from(projects).where(featuredWhere),
    ]);

    const projectsWithImages = await Promise.all(
      projectsList.map(async (project) => {
        const images = await db
          .select({
            id: projectImages.id,
            url: projectImages.url,
            order: projectImages.order,
            alt: projectImages.alt,
            caption: projectImages.caption,
          })
          .from(projectImages)
          .where(eq(projectImages.projectId, project.id))
          .orderBy(asc(projectImages.order));

        return { ...project, images };
      })
    );

    const publicProjects = projectsWithImages.map((project) => mapPublicImageUrls(project, {
      fields: ['imageUrl'],
      nested: { images: ['url'] },
    }));

    return successResponse({
      projects: publicProjects,
      meta: {
        total,
        featured: featuredCount,
      },
    });
  } catch {
    return serverErrorResponse();
  }
}
