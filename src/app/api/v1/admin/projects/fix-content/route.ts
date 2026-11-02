import { NextResponse } from 'next/server';
import { withAdminAuthContext } from '@/lib/api/middleware/auth';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import { eq, isNotNull } from 'drizzle-orm';

type ProjectContentRepairUpdate = Partial<
  Pick<typeof projects.$inferInsert, 'content' | 'updatedAt'>
>;

async function handlePost() {
  try {
    const allProjects = await db
      .select({ id: projects.id, title: projects.title, content: projects.content })
      .from(projects)
      .where(isNotNull(projects.content));

    const fixedProjects = [];

    for (const project of allProjects) {
      if (!project.content) continue;

      let content = project.content;
      let iterations = 0;
      const maxIterations = 10;

      while (typeof content === 'string' && iterations < maxIterations) {
        try {
          const parsed = JSON.parse(content);
          if (typeof parsed === 'object' && parsed !== null && parsed.type === 'doc') {
            const now = new Date().toISOString();
            const updateData: ProjectContentRepairUpdate = {
              content: JSON.stringify(parsed),
              updatedAt: now,
            };
            await db.update(projects).set(updateData).where(eq(projects.id, project.id));

            fixedProjects.push({
              id: project.id,
              title: project.title,
              layers: iterations + 1,
            });
            break;
          } else {
            content = parsed;
            iterations++;
          }
        } catch {
          const now = new Date().toISOString();
          const updateData: ProjectContentRepairUpdate = {
            content: '{"type":"doc","content":[]}',
            updatedAt: now,
          };
          await db.update(projects).set(updateData).where(eq(projects.id, project.id));

          fixedProjects.push({
            id: project.id,
            title: project.title,
            reset: true,
          });
          break;
        }
      }

      if (iterations >= maxIterations) {
        const now = new Date().toISOString();
        const updateData: ProjectContentRepairUpdate = {
          content: '{"type":"doc","content":[]}',
          updatedAt: now,
        };
        await db.update(projects).set(updateData).where(eq(projects.id, project.id));

        fixedProjects.push({
          id: project.id,
          title: project.title,
          reset: true,
          tooManyLayers: true,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixedProjects.length} projects`,
      data: fixedProjects,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fix content' }, { status: 500 });
  }
}

export const POST = withAdminAuthContext(handlePost);
