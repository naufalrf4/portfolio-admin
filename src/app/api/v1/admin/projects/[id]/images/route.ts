import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthContext } from '@/lib/api/middleware/auth';
import { db } from '@/lib/db';
import { projectImages, projects } from '@/lib/db/schema';
import { eq, asc, desc } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

interface RouteContext {
  params: Promise<{ id: string }>;
}

type ProjectImageInsert = typeof projectImages.$inferInsert;
type ProjectUpdate = Partial<Pick<typeof projects.$inferInsert, 'thumbnailId' | 'updatedAt'>>;

async function handleGet(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
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
    return NextResponse.json({ success: false, error: 'Failed to fetch images' }, { status: 500 });
  }
}

async function handlePost(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { url, key, caption, alt } = body;

    if (!url || !key) {
      return NextResponse.json({ error: 'URL and key are required' }, { status: 400 });
    }

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
      url,
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
      data: image,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create image' }, { status: 500 });
  }
}

export const GET = withAdminAuthContext(handleGet);
export const POST = withAdminAuthContext(handlePost);
