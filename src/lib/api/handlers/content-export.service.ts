import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { projects, knowledgeDocs, blogLink } from '@/lib/db/schema';
import { getAboutMeRecord } from '@/lib/api/handlers/about-read.service';
import type {
  ExperienceItem,
  FreelanceProfile,
  FreelanceProjectReference,
} from '@/lib/validations/about.schema';

export interface RagAboutContent {
  bio: string;
  skills: string[];
  experience: ExperienceItem[];
  freelanceProfile: FreelanceProfile | null;
}

export interface RagProjectContent {
  title: string;
  slug: string;
  summary: string;
  description: string;
  content: string;
  techStack: string[];
}

export interface RagKnowledgeDocument {
  id: string;
  filename: string;
  content: string;
}

export interface RagBlogContent {
  id: string;
  url: string;
  title: string;
  description: string | null;
  category: string | null;
  tags: string[];
  publishedAt: string;
  visible: boolean;
}

export interface RagContentExport {
  aboutMe: RagAboutContent;
  projects: RagProjectContent[];
  knowledgeDocs: RagKnowledgeDocument[];
  blogs: RagBlogContent[];
}

export interface FreelanceProfileIntentContext {
  freelanceProfile: FreelanceProfile | null;
}

function normalizeRagSkills(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((skill) => {
    if (typeof skill === 'string' && skill.trim().length > 0) {
      return [skill.trim()];
    }

    if (typeof skill === 'object' && skill !== null && 'name' in skill) {
      const name = skill.name;
      return typeof name === 'string' && name.trim().length > 0 ? [name.trim()] : [];
    }

    return [];
  });
}

function normalizeExperienceItems(value: unknown): ExperienceItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => {
      const organization =
        (typeof item.organization === 'string' && item.organization.trim()) ||
        (typeof item.company === 'string' && item.company.trim()) ||
        '';

      return {
        type:
          item.type === 'Education' ||
          item.type === 'Work' ||
          item.type === 'Organizational' ||
          item.type === 'Certification'
            ? item.type
            : 'Work',
        title: typeof item.title === 'string' ? item.title : '',
        organization,
        location: typeof item.location === 'string' ? item.location : '',
        startDate: typeof item.startDate === 'string' ? item.startDate : '',
        endDate: typeof item.endDate === 'string' || item.endDate === null ? item.endDate : '',
        description: typeof item.description === 'string' ? item.description : '',
        logoUrl: typeof item.logoUrl === 'string' ? item.logoUrl : '',
        skills: Array.isArray(item.skills)
          ? item.skills.filter(
              (skill): skill is string => typeof skill === 'string' && skill.trim().length > 0
            )
          : [],
      } satisfies ExperienceItem;
    })
    .filter((item) => item.title && item.organization && item.startDate);
}

function hasFreelanceProfileContent(
  profile: FreelanceProfile | null | undefined
): profile is FreelanceProfile {
  if (!profile) {
    return false;
  }

  return Boolean(
    (profile.hourlyRate !== null && profile.hourlyRate !== undefined) ||
    (profile.completedProjects !== null && profile.completedProjects !== undefined) ||
    profile.pricingNotes ||
    profile.featurePricing?.length ||
    profile.projectReferences?.length
  );
}

function normalizeFreelanceProfile(profile: unknown): FreelanceProfile | null {
  if (!profile || typeof profile !== 'object') {
    return null;
  }

  const typedProfile = profile as FreelanceProfile;
  const featurePricing = Array.isArray(typedProfile.featurePricing)
    ? typedProfile.featurePricing
        .filter((item): item is NonNullable<FreelanceProfile['featurePricing']>[number] =>
          Boolean(item?.feature?.trim())
        )
        .map((item) => ({
          feature: item.feature.trim(),
          price: item.price ?? null,
          notes: item.notes?.trim() || '',
          relatedProjectSlugs: Array.isArray(item.relatedProjectSlugs)
            ? item.relatedProjectSlugs.filter((slug) => slug.trim().length > 0)
            : [],
        }))
    : [];
  const projectReferences = Array.isArray(typedProfile.projectReferences)
    ? typedProfile.projectReferences
        .filter(
          (item): item is FreelanceProjectReference =>
            Boolean(item?.slug?.trim()) && Boolean(item?.title?.trim())
        )
        .map((item) => ({
          slug: item.slug.trim(),
          title: item.title.trim(),
          notes: item.notes?.trim() || '',
        }))
    : [];

  const normalized: FreelanceProfile = {
    hourlyRate: typeof typedProfile.hourlyRate === 'number' ? typedProfile.hourlyRate : null,
    currency: typedProfile.currency?.trim() || 'IDR',
    completedProjects:
      typeof typedProfile.completedProjects === 'number' ? typedProfile.completedProjects : null,
    pricingNotes: typedProfile.pricingNotes?.trim() || '',
    featurePricing,
    projectReferences,
  };

  return hasFreelanceProfileContent(normalized) ? normalized : null;
}

export class ContentExportService {
  async exportForRAG(): Promise<RagContentExport> {
    const [aboutMeData, projectsData, knowledgeDocsData, blogsData] = await Promise.all([
      this.getAboutMe(),
      this.getProjects(),
      this.getKnowledgeDocs(),
      this.getBlogs(),
    ]);

    return {
      aboutMe: aboutMeData,
      projects: projectsData,
      knowledgeDocs: knowledgeDocsData,
      blogs: blogsData,
    };
  }

  async exportFreelanceProfileIntentContext(): Promise<FreelanceProfileIntentContext> {
    const aboutData = await this.getAboutMe();

    return {
      freelanceProfile: aboutData.freelanceProfile,
    };
  }

  private async getAboutMe(): Promise<RagAboutContent> {
    const about = await getAboutMeRecord();

    if (!about) {
      return {
        bio: '',
        skills: [],
        experience: [],
        freelanceProfile: null,
      };
    }

    return {
      bio: about.bio || '',
      skills: normalizeRagSkills(about.skills),
      experience: normalizeExperienceItems(about.experience),
      freelanceProfile: normalizeFreelanceProfile(about.freelanceProfile),
    };
  }

  private async getProjects(): Promise<RagProjectContent[]> {
    const projectsList = await db.query.projects.findMany({
      where: eq(projects.visible, true),
    });

    return projectsList.map((project) => ({
      title: project.title,
      slug: project.slug,
      summary: project.summary || '',
      description: project.description || '',
      content: project.content || '',
      techStack: project.techStack || [],
    }));
  }

  private async getKnowledgeDocs(): Promise<RagKnowledgeDocument[]> {
    const docs = await db
      .select({
        id: knowledgeDocs.id,
        filename: knowledgeDocs.filename,
        content: knowledgeDocs.content,
      })
      .from(knowledgeDocs);

    return docs;
  }

  private async getBlogs(): Promise<RagBlogContent[]> {
    const blogLinks = await db
      .select({
        id: blogLink.id,
        url: blogLink.url,
        title: blogLink.title,
        description: blogLink.description,
        category: blogLink.category,
        tags: blogLink.tags,
        publishedAt: blogLink.publishedAt,
        visible: blogLink.visible,
      })
      .from(blogLink)
      .where(eq(blogLink.visible, true));

    return blogLinks.map((blog) => ({
      ...blog,
      tags: blog.tags ?? [],
    }));
  }
}

export const contentExportService = new ContentExportService();
