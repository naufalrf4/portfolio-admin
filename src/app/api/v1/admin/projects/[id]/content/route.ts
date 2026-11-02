import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthContext } from '@/lib/api/middleware/auth';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface RouteContext {
  params: Promise<{ id: string }>;
}

type ProjectContentUpdate = Partial<
  Pick<typeof projects.$inferInsert, 'content' | 'summary' | 'updatedAt'>
>;

async function handlePatch(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, summary } = body;

    if (content === undefined && summary === undefined) {
      return NextResponse.json({ error: 'Content or summary is required' }, { status: 400 });
    }

    if (content !== undefined && typeof content !== 'string') {
      return NextResponse.json({ error: 'Content must be markdown text' }, { status: 400 });
    }

    const contentToSave = content;

    const now = new Date().toISOString();
    const updateData: ProjectContentUpdate = { updatedAt: now };

    if (contentToSave !== undefined) {
      updateData.content = contentToSave;
    }

    if (summary !== undefined) {
      updateData.summary = summary;
    }

    const [project] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: project.id,
        content: project.content,
        summary: project.summary,
        updatedAt: project.updatedAt,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

async function handleGet(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const result = await db
      .select({
        id: projects.id,
        content: projects.content,
        summary: projects.summary,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    const project = result[0];

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: project.id,
        content: project.content,
        summary: project.summary,
        updatedAt: project.updatedAt,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch content' }, { status: 500 });
  }
}

export const PATCH = withAdminAuthContext(handlePatch);
export const GET = withAdminAuthContext(handleGet);
