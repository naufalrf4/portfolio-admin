import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthContext } from '@/lib/api/middleware/auth';
import { db } from '@/lib/db';
import { projectImages, projects } from '@/lib/db/schema';
import { and, asc, eq } from 'drizzle-orm';
import { storageService } from '@/lib/services/storage';

interface RouteContext {
  params: Promise<{ id: string; imageId: string }>;
}

type ProjectImageUpdate = Partial<
  Pick<typeof projectImages.$inferInsert, 'caption' | 'alt' | 'order'>
>;
type ProjectThumbnailUpdate = Partial<
  Pick<typeof projects.$inferInsert, 'thumbnailId' | 'updatedAt'>
>;

async function handlePatch(request: NextRequest, { params }: RouteContext) {
  try {
    const { id, imageId } = await params;
    const body = await request.json();
    const { caption, alt, order } = body;

    const updateData: ProjectImageUpdate = {};

    if (caption !== undefined) {
      updateData.caption = caption;
    }
    if (alt !== undefined) {
      updateData.alt = alt;
    }
    if (order !== undefined) {
      updateData.order = order;
    }

    const [image] = await db
      .update(projectImages)
      .set(updateData)
      .where(and(eq(projectImages.id, imageId), eq(projectImages.projectId, id)))
      .returning();

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: image,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update image' }, { status: 500 });
  }
}

async function handleDelete(request: NextRequest, { params }: RouteContext) {
  try {
    const { id, imageId } = await params;
    const imageResult = await db
      .select()
      .from(projectImages)
      .where(and(eq(projectImages.id, imageId), eq(projectImages.projectId, id)))
      .limit(1);

    const image = imageResult[0];

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    await storageService.deleteFile(image.key);

    await db
      .delete(projectImages)
      .where(and(eq(projectImages.id, imageId), eq(projectImages.projectId, id)));

    const remainingImages = await db
      .select()
      .from(projectImages)
      .where(eq(projectImages.projectId, id))
      .orderBy(asc(projectImages.order));

    for (let i = 0; i < remainingImages.length; i++) {
      await db
        .update(projectImages)
        .set({ order: i })
        .where(eq(projectImages.id, remainingImages[i].id));
    }

    const now = new Date().toISOString();
    if (remainingImages.length > 0) {
      const projectUpdate: ProjectThumbnailUpdate = {
        thumbnailId: remainingImages[0].id,
        updatedAt: now,
      };
      await db.update(projects).set(projectUpdate).where(eq(projects.id, id));
    } else {
      const projectUpdate: ProjectThumbnailUpdate = { thumbnailId: null, updatedAt: now };
      await db.update(projects).set(projectUpdate).where(eq(projects.id, id));
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete image' }, { status: 500 });
  }
}

export const PATCH = withAdminAuthContext(handlePatch);
export const DELETE = withAdminAuthContext(handleDelete);
