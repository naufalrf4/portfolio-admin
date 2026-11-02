import { successResponse, notFoundResponse, serverErrorResponse } from '@/lib/api/responses';
import { mapPublicImageUrls, signAssetUrls } from '@/lib/utils/sign-urls';
import { normalizeAboutSkills } from '@/lib/about-skills';
import { getAboutMeRecord } from '@/lib/api/handlers/about-read.service';
import { profileLinksService } from '@/lib/api/handlers/profile-links.service';
import { logger } from '@/lib/utils/logger';

interface Skill {
  name: string;
  level: number;
  category: string;
}

interface Experience {
  type: string;
  title: string;
  organization: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  description: string;
  logoUrl: string | null;
  skills: string[];
}

interface SocialLink {
  platform: string;
  url: string;
}

interface PublicAboutData {
  fullName: string;
  tagline: string | null;
  roles: string[];
  shortBio: string | null;
  bio: string;
  email: string;
  location: string | null;
  avatarUrl: string | null;
  resumeUrl: string | null;
  availabilityStatus: 'available' | 'busy' | 'unavailable' | null;
  skills: Skill[];
  experience: Experience[];
  socialLinks: SocialLink[];
  updatedAt: string;
}

type StoredExperience = {
  type?: unknown;
  title?: unknown;
  company?: unknown;
  organization?: unknown;
  period?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  location?: unknown;
  description?: unknown;
  logoUrl?: unknown;
  skills?: unknown;
};

type ProfileLinkRecord = {
  label?: string | null;
  icon?: string | null;
  url?: string | null;
};

type SupportedPlatform =
  | 'email'
  | 'github'
  | 'linkedin'
  | 'twitter'
  | 'instagram'
  | 'youtube'
  | 'website';

function parseJsonField<T>(value: unknown, defaultValue: T): T {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return defaultValue;
    }
  }
  return value as T;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function normalizeSkills(value: unknown): Skill[] {
  return normalizeAboutSkills(parseJsonField<unknown[]>(value, []));
}

function normalizeExperience(value: unknown): Experience[] {
  const parsed = parseJsonField<StoredExperience[]>(value, []);

  return parsed.flatMap((item) => {
    const type = asString(item.type);
    const title = asString(item.title);
    const organization = asString(item.organization) ?? asString(item.company);
    const startDate = asString(item.startDate) ?? asString(item.period);
    const endDate = asString(item.endDate);
    const description = asString(item.description) ?? '';
    const location = asString(item.location);
    const logoUrl = asString(item.logoUrl);
    const skills = parseJsonField<unknown[]>(item.skills, []).flatMap((skill) =>
      typeof skill === 'string' && skill.trim().length > 0 ? [skill.trim()] : []
    );

    if (!type || !title || !organization || !startDate) {
      return [];
    }

    return [
      {
        type,
        title,
        organization,
        location,
        startDate,
        endDate,
        description,
        logoUrl,
        skills,
      },
    ];
  });
}

function normalizeComparableUrl(value: string): string {
  return value.trim().replace(/\/+$/, '').toLowerCase();
}

function getUrlMetadata(rawUrl: string | null): { normalizedUrl: string; host: string } | null {
  if (!rawUrl) {
    return null;
  }

  const normalizedUrl = normalizeComparableUrl(rawUrl);

  if (normalizedUrl.startsWith('mailto:')) {
    return { normalizedUrl, host: 'mailto' };
  }

  try {
    const url = new URL(normalizedUrl);
    return { normalizedUrl, host: url.hostname.replace(/^www\./, '') };
  } catch {
    return null;
  }
}

function hasKeyword(value: string, keyword: string): boolean {
  return value === keyword || value.includes(`${keyword} `) || value.includes(` ${keyword}`);
}

function inferPlatform(link: ProfileLinkRecord): SupportedPlatform | null {
  const label = asString(link.label)?.toLowerCase() ?? '';
  const icon = asString(link.icon)?.toLowerCase() ?? '';
  const url = asString(link.url);
  const urlMetadata = getUrlMetadata(url);
  const normalizedUrl = urlMetadata?.normalizedUrl ?? '';
  const host = urlMetadata?.host ?? '';
  const combined = `${label} ${icon} ${normalizedUrl}`;

  if (host === 'mailto' || hasKeyword(combined, 'email') || hasKeyword(combined, 'mail')) {
    return 'email';
  }

  if (host === 'github.com' || combined.includes('github')) {
    return 'github';
  }

  if (host === 'linkedin.com' || host.endsWith('.linkedin.com') || combined.includes('linkedin')) {
    return 'linkedin';
  }

  if (
    host === 'twitter.com' ||
    host === 'x.com' ||
    host.endsWith('.x.com') ||
    combined.includes('twitter') ||
    hasKeyword(combined, 'x')
  ) {
    return 'twitter';
  }

  if (
    host === 'instagram.com' ||
    host.endsWith('.instagram.com') ||
    combined.includes('instagram')
  ) {
    return 'instagram';
  }

  if (host === 'youtube.com' || host === 'youtu.be' || combined.includes('youtube')) {
    return 'youtube';
  }

  if (
    combined.includes('website') ||
    combined.includes('portfolio') ||
    combined.includes('site') ||
    (host.length > 0 && host !== 'mailto')
  ) {
    return 'website';
  }

  return null;
}

function normalizeProfileLinksAsSocialLinks(links: ProfileLinkRecord[]): SocialLink[] {
  const seen = new Set<string>();

  return links.flatMap((link) => {
    const url = asString(link.url);
    const platform = inferPlatform(link);

    if (!url || !platform) {
      return [];
    }

    const key = `${platform}:${normalizeComparableUrl(url)}`;
    if (seen.has(key)) {
      return [];
    }

    seen.add(key);
    return [{ platform, url }];
  });
}

export async function GET() {
  try {
    const [aboutMeData, visibleProfileLinks] = await Promise.all([
      getAboutMeRecord(),
      profileLinksService.getAll({ visible: true }),
    ]);

    if (!aboutMeData) {
      return notFoundResponse('About me');
    }

    const availability = aboutMeData.availabilityStatus;
    const publicData: PublicAboutData = {
      fullName: aboutMeData.fullName,
      tagline: aboutMeData.tagline,
      roles: aboutMeData.roles || [],
      shortBio: asString(aboutMeData.shortBio),
      bio: aboutMeData.bio,
      email: aboutMeData.email,
      location: aboutMeData.location,
      avatarUrl: aboutMeData.avatarUrl,
      resumeUrl: aboutMeData.resumeUrl,
      availabilityStatus:
        availability === 'available' || availability === 'busy' || availability === 'unavailable'
          ? availability
          : null,
      skills: normalizeSkills(aboutMeData.skills),
      experience: normalizeExperience(aboutMeData.experience),
      socialLinks: normalizeProfileLinksAsSocialLinks(visibleProfileLinks),
      updatedAt: aboutMeData.updatedAt,
    };

    const publicImages = mapPublicImageUrls(publicData, {
      fields: ['avatarUrl'],
      nested: {
        experience: ['logoUrl'],
      },
    });
    const signedData = await signAssetUrls(publicImages, { fields: ['resumeUrl'] });

    return successResponse(signedData);
  } catch (error) {
    logger.error('Public about route failed', error);
    return serverErrorResponse(
      process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    );
  }
}
