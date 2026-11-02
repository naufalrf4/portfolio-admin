import { createId } from '@paralleldrive/cuid2';
import { db } from '@/lib/db';
import { eq, and, or, ilike, asc, count } from 'drizzle-orm';
import { projects, projectImages } from '@/lib/db/schema';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQueryInput,
} from '@/lib/validations/project.schema';

type ProjectInsert = typeof projects.$inferInsert;
type ProjectUpdate = Partial<ProjectInsert>;

export class ProjectsService {
  async getAll(query: ProjectQueryInput) {
    const { page, limit, category, featured, visible, search } = query;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (category) conditions.push(eq(projects.category, category));
    if (featured !== undefined) conditions.push(eq(projects.featured, featured));
    if (visible !== undefined) conditions.push(eq(projects.visible, visible));
    if (search) {
      conditions.push(
        or(
          ilike(projects.title, `%${search}%`),
          ilike(projects.summary, `%${search}%`),
          ilike(projects.description, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [projectsResult, [{ total }]] = await Promise.all([
      db.query.projects.findMany({
        where: whereClause,
        offset,
        limit,
        orderBy: [asc(projects.order)],
      }),
      db.select({ total: count() }).from(projects).where(whereClause),
    ]);
    return {
      projects: projectsResult,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    return db.query.projects.findFirst({
      where: eq(projects.id, id),
    });
  }

  async getBySlug(slug: string) {
    return db.query.projects.findFirst({
      where: eq(projects.slug, slug),
      with: {
        projectImages: {
          orderBy: [asc(projectImages.order)],
        },
      },
    });
  }

  async create(data: CreateProjectInput) {
    const { description, liveUrl, repoUrl, startDate, endDate, projectDate, tags, ...rest } = data;
    const now = new Date().toISOString();
    const projectData: ProjectInsert = {
      id: createId(),
      ...rest,
      description: description || '',
      liveUrl: liveUrl || null,
      repoUrl: repoUrl || null,
      tags: tags || [],
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      projectDate: projectDate || null,
      createdAt: now,
      updatedAt: now,
    };
    const [created] = await db.insert(projects).values(projectData).returning();

    return db.query.projects.findFirst({
      where: eq(projects.id, created.id),
    });
  }

  async update(id: string, data: UpdateProjectInput) {
    const { startDate, endDate, ...rest } = data;
    const updateData: ProjectUpdate = {
      ...rest,
      updatedAt: new Date().toISOString(),
    };
    if (startDate !== undefined) {
      updateData.startDate = startDate ? new Date(startDate).toISOString() : null;
    }
    if (endDate !== undefined) {
      updateData.endDate = endDate ? new Date(endDate).toISOString() : null;
    }

    const [updated] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();

    if (!updated) {
      throw new Error('Project not found');
    }

    return db.query.projects.findFirst({
      where: eq(projects.id, id),
    });
  }

  async delete(id: string) {
    const [deleted] = await db.delete(projects).where(eq(projects.id, id)).returning();
    return deleted;
  }

  async checkSlugExists(slug: string, excludeId?: string) {
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);
    if (!project) return false;
    if (excludeId && project.id === excludeId) return false;
    return true;
  }
}

export const projectsService = new ProjectsService();
