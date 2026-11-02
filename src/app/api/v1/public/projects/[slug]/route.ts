import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { successResponse, notFoundResponse, serverErrorResponse } from '@/lib/api/responses';
import { signAssetUrls } from '@/lib/utils/sign-urls';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const project = await db.query.projects.findFirst({
      where: eq(projects.slug, slug),
      with: {
        projectImages: {
          orderBy: (img, { asc }) => [asc(img.order)],
        },
      },
    });

    if (!project || !project.visible) {
      return notFoundResponse('Project');
    }

    const projectData = {
      id: project.id,
      title: project.title,
      slug: project.slug,
      summary: project.summary,
      description: project.description,
      content: project.content,
      category: project.category,
      techStack: project.techStack,
      liveUrl: project.liveUrl,
      repoUrl: project.repoUrl,
      imageUrl: project.imageUrl,
      featured: project.featured,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      projectDate: project.projectDate,
      images: project.projectImages,
    };

    const signedProject = await signAssetUrls(projectData, {
      fields: ['imageUrl'],
      nested: { images: ['url'] },
    });

    return successResponse(signedProject);
  } catch {
    return serverErrorResponse();
  }
}
