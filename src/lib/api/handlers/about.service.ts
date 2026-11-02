import { db } from '@/lib/db';
import { aboutMe } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { UpdateAboutInput } from '@/lib/validations/about.schema';
import { createId } from '@paralleldrive/cuid2';
import { getAboutMeRecord } from '@/lib/api/handlers/about-read.service';
import { normalizeAboutSkills } from '@/lib/about-skills';
import { normalizeStoredAssetValue } from '@/lib/services/storage';

type AboutInsert = typeof aboutMe.$inferInsert;

function sanitizeAssetValue(value?: string | null): string | null {
  return normalizeStoredAssetValue(value);
}

function normalizeExperienceItems(
  experience: UpdateAboutInput['experience']
): AboutInsert['experience'] {
  if (!experience) {
    return null;
  }

  return experience.map((item) => ({
    ...item,
    logoUrl: sanitizeAssetValue(item.logoUrl) ?? '',
    skills: item.skills?.map((skill) => skill.trim()).filter(Boolean) ?? [],
  }));
}

function normalizeFreelanceProfile(
  profile: UpdateAboutInput['freelanceProfile']
): AboutInsert['freelanceProfile'] {
  if (!profile) {
    return null;
  }

  const featurePricing = (profile.featurePricing ?? [])
    .map((item) => ({
      feature: item.feature.trim(),
      price: typeof item.price === 'number' && Number.isFinite(item.price) ? item.price : null,
      notes: item.notes?.trim() || '',
      relatedProjectSlugs:
        item.relatedProjectSlugs?.map((slug) => slug.trim()).filter(Boolean) ?? [],
    }))
    .filter((item) => item.feature);

  const projectReferences = (profile.projectReferences ?? [])
    .map((item) => ({
      slug: item.slug.trim(),
      title: item.title.trim(),
      notes: item.notes?.trim() || '',
    }))
    .filter((item) => item.slug && item.title);

  const normalized = {
    hourlyRate:
      typeof profile.hourlyRate === 'number' && Number.isFinite(profile.hourlyRate)
        ? profile.hourlyRate
        : null,
    currency: profile.currency?.trim().toUpperCase() || 'IDR',
    completedProjects:
      typeof profile.completedProjects === 'number' && Number.isFinite(profile.completedProjects)
        ? Math.max(0, Math.trunc(profile.completedProjects))
        : null,
    pricingNotes: profile.pricingNotes?.trim() || '',
    featurePricing,
    projectReferences,
  };

  const hasContent =
    normalized.hourlyRate !== null ||
    normalized.completedProjects !== null ||
    normalized.pricingNotes.length > 0 ||
    normalized.featurePricing.length > 0 ||
    normalized.projectReferences.length > 0;

  return hasContent ? normalized : null;
}

export class AboutService {
  async get() {
    const aboutMeData = await getAboutMeRecord();

    if (!aboutMeData) {
      return this.createDefault();
    }

    return aboutMeData;
  }

  async update(data: UpdateAboutInput) {
    const result = await db.select().from(aboutMe).limit(1);
    const existing = result[0];
    const normalizedData = this.normalizePayload(data, existing?.id);

    if (!existing) {
      const [created] = await db.insert(aboutMe).values(normalizedData).returning();
      return created;
    }

    const [updated] = await db
      .update(aboutMe)
      .set({
        fullName: normalizedData.fullName,
        tagline: normalizedData.tagline,
        roles: normalizedData.roles,
        shortBio: normalizedData.shortBio,
        bio: normalizedData.bio,
        email: normalizedData.email,
        phone: normalizedData.phone,
        location: normalizedData.location,
        avatarUrl: normalizedData.avatarUrl,
        resumeUrl: normalizedData.resumeUrl,
        skills: normalizedData.skills,
        experience: normalizedData.experience,
        freelanceProfile: normalizedData.freelanceProfile,
        updatedAt: normalizedData.updatedAt,
      })
      .where(eq(aboutMe.id, existing.id))
      .returning();

    return updated;
  }

  private normalizePayload(data: UpdateAboutInput, id = createId()): AboutInsert {
    return {
      id,
      updatedAt: new Date().toISOString(),
      fullName: data.fullName,
      tagline: data.tagline ?? '',
      roles: data.roles,
      shortBio: data.shortBio ?? null,
      bio: data.bio ?? '',
      email: data.email,
      phone: data.phone ?? null,
      location: data.location ?? null,
      avatarUrl: sanitizeAssetValue(data.avatarUrl),
      resumeUrl: sanitizeAssetValue(data.resumeUrl),
      skills: normalizeAboutSkills(data.skills),
      experience: normalizeExperienceItems(data.experience),
      freelanceProfile: normalizeFreelanceProfile(data.freelanceProfile),
    };
  }

  private async createDefault() {
    const [created] = await db
      .insert(aboutMe)
      .values({
        id: createId(),
        updatedAt: new Date().toISOString(),
        fullName: 'Full Name',
        tagline: 'Your Tagline',
        email: 'email@example.com',
        shortBio: '',
        bio: '',
        roles: [],
        skills: [],
        freelanceProfile: null,
      })
      .returning();

    return created;
  }
}

export const aboutService = new AboutService();
