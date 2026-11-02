import { db } from '@/lib/db';
import { aboutMe } from '@/lib/db/schema';
import { normalizeAboutSkills } from '@/lib/about-skills';

export interface AboutMeRecord {
  id: string;
  fullName: string;
  tagline: string;
  roles: string[] | null;
  shortBio: string | null;
  bio: string;
  email: string;
  phone: string | null;
  location: string | null;
  avatarUrl: string | null;
  resumeUrl: string | null;
  availabilityStatus: string | null;
  skills: unknown;
  experience: unknown;
  freelanceProfile: unknown;
  createdAt: string;
  updatedAt: string;
}

function normalizeAboutRecord(record: AboutMeRecord | undefined): AboutMeRecord | undefined {
  if (!record) {
    return undefined;
  }

  return {
    ...record,
    skills: normalizeAboutSkills(record.skills),
  };
}

function isMissingFreelanceProfileColumnError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const cause = 'cause' in error ? error.cause : undefined;
  if (!cause || typeof cause !== 'object') {
    return false;
  }

  return 'code' in cause && cause.code === '42703';
}

async function selectAboutMeWithFreelanceProfile(): Promise<AboutMeRecord | undefined> {
  const [record] = await db
    .select({
      id: aboutMe.id,
      fullName: aboutMe.fullName,
      tagline: aboutMe.tagline,
      roles: aboutMe.roles,
      shortBio: aboutMe.shortBio,
      bio: aboutMe.bio,
      email: aboutMe.email,
      phone: aboutMe.phone,
      location: aboutMe.location,
      avatarUrl: aboutMe.avatarUrl,
      resumeUrl: aboutMe.resumeUrl,
      availabilityStatus: aboutMe.availabilityStatus,
      skills: aboutMe.skills,
      experience: aboutMe.experience,
      freelanceProfile: aboutMe.freelanceProfile,
      createdAt: aboutMe.createdAt,
      updatedAt: aboutMe.updatedAt,
    })
    .from(aboutMe)
    .limit(1);

  return record;
}

async function selectAboutMeWithoutFreelanceProfile(): Promise<AboutMeRecord | undefined> {
  const [record] = await db
    .select({
      id: aboutMe.id,
      fullName: aboutMe.fullName,
      tagline: aboutMe.tagline,
      roles: aboutMe.roles,
      shortBio: aboutMe.shortBio,
      bio: aboutMe.bio,
      email: aboutMe.email,
      phone: aboutMe.phone,
      location: aboutMe.location,
      avatarUrl: aboutMe.avatarUrl,
      resumeUrl: aboutMe.resumeUrl,
      availabilityStatus: aboutMe.availabilityStatus,
      skills: aboutMe.skills,
      experience: aboutMe.experience,
      createdAt: aboutMe.createdAt,
      updatedAt: aboutMe.updatedAt,
    })
    .from(aboutMe)
    .limit(1);

  if (!record) {
    return undefined;
  }

  return {
    ...record,
    freelanceProfile: null,
  };
}

export async function getAboutMeRecord(): Promise<AboutMeRecord | undefined> {
  try {
    return normalizeAboutRecord(await selectAboutMeWithFreelanceProfile());
  } catch (error) {
    if (!isMissingFreelanceProfileColumnError(error)) {
      throw error;
    }

    return normalizeAboutRecord(await selectAboutMeWithoutFreelanceProfile());
  }
}
