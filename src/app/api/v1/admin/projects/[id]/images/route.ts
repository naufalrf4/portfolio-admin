import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthContext } from '@/lib/api/middleware/auth';
import { db } from '@/lib/db';
import { projectImages, projects } from '@/lib/db/schema';
import { eq, asc, desc } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { storageService } from '@/lib/services/storage';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

type ProjectImageInsert = typeof projectImages.$inferInsert;
type ProjectUpdate = Partial<Pick<typeof projects.$inferInsert, 'thumbnailId' | 'updatedAt'>>;

const createProjectImageSchema = z.object({
  url: z.string().url(),
  key: z.string().regex(/^projects\/.+/),
  caption: z.string().max(500).nullable().optional(),
  alt: z.string().max(500).nullable().optional(),
});

async function handleGet(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const images = await db
      .select()
      .from(projectImages)
      .where(eq(projectImages.projectId, id))
      .orderBy(asc(projectImages.order));

    const signedImages = await Promise.all(
      images.map(async (image) => ({
        ...image,
        url: image.key ? await storageService.signGetUrl(image.key) : image.url,
      }))
    );

    return NextResponse.json({
      success: true,
      data: signedImages,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch images' }, { status: 500 });
  }
}

async function handlePost(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = createProjectImageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid project image', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { key, caption, alt } = validation.data;

    const maxOrderResult = await db
      .select({ order: projectImages.order })
      .from(projectImages)
      .where(eq(projectImages.projectId, id))
      .orderBy(desc(projectImages.order))
      .limit(1);

    const order = maxOrderResult.length > 0 ? maxOrderResult[0].order + 1 : 0;

    const now = new Date().toISOString();
    const imageData: ProjectImageInsert = {
      id: createId(),
      projectId: id,
      url: key,
      key,
      caption,
      alt,
      order,
      createdAt: now,
    };

    const [image] = await db.insert(projectImages).values(imageData).returning();

    if (order === 0) {
      const projectUpdate: ProjectUpdate = { thumbnailId: image.id, updatedAt: now };
      await db.update(projects).set(projectUpdate).where(eq(projects.id, id));
    }

    return NextResponse.json({
      success: true,
      data: {
        ...image,
        url: await storageService.signGetUrl(key),
      },
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create image' }, { status: 500 });
  }
}

export const GET = withAdminAuthContext(handleGet);
export const POST = withAdminAuthContext(handlePost);
