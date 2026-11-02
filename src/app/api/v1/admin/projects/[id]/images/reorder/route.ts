import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthContext } from '@/lib/api/middleware/auth';
import { db } from '@/lib/db';
import { projectImages, projects } from '@/lib/db/schema';
import { and, asc, eq, inArray } from 'drizzle-orm';

interface RouteContext {
  params: Promise<{ id: string }>;
}

type ProjectImageOrderUpdate = Partial<Pick<typeof projectImages.$inferInsert, 'order'>>;
type ProjectThumbnailUpdate = Partial<
  Pick<typeof projects.$inferInsert, 'thumbnailId' | 'updatedAt'>
>;

async function handlePatch(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { imageIds } = body as { imageIds: string[] };

    if (!Array.isArray(imageIds)) {
      return NextResponse.json({ error: 'imageIds must be an array' }, { status: 400 });
    }

    if (imageIds.length > 0) {
      const ownedImages = await db
        .select({ id: projectImages.id })
        .from(projectImages)
        .where(and(eq(projectImages.projectId, id), inArray(projectImages.id, imageIds)));

      if (ownedImages.length !== imageIds.length) {
        return NextResponse.json(
          { error: 'One or more images do not belong to this project' },
          { status: 400 }
        );
      }
    }

    await db.transaction(async (tx) => {
      for (let index = 0; index < imageIds.length; index++) {
        const imageUpdate: ProjectImageOrderUpdate = { order: index };
        await tx
          .update(projectImages)
          .set(imageUpdate)
          .where(and(eq(projectImages.id, imageIds[index]), eq(projectImages.projectId, id)));
      }
    });

    if (imageIds.length > 0) {
      const now = new Date().toISOString();
      const projectUpdate: ProjectThumbnailUpdate = { thumbnailId: imageIds[0], updatedAt: now };
      await db.update(projects).set(projectUpdate).where(eq(projects.id, id));
    }

    const images = await db
      .select()
      .from(projectImages)
      .where(eq(projectImages.projectId, id))
      .orderBy(asc(projectImages.order));

    return NextResponse.json({
      success: true,
      data: images,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to reorder images' },
      { status: 500 }
    );
  }
}

export const PATCH = withAdminAuthContext(handlePatch);
