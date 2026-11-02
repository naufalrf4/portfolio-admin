import { z } from 'zod';

const assetValueSchema = z.string().min(1);

const experienceItemSchema = z.object({
  type: z.enum(['Education', 'Work', 'Organizational', 'Certification']),
  title: z.string().min(1).max(200),
  organization: z.string().min(1).max(200),
  location: z.string().optional().or(z.literal('')),
  startDate: z.string().min(1),
  endDate: z.string().optional().or(z.literal('')).nullable(),
  description: z.string().optional().or(z.literal('')),
  logoUrl: assetValueSchema.optional().or(z.literal('')),
  skills: z.array(z.string().min(1).max(100)).max(20).optional(),
});

const freelanceFeaturePriceSchema = z.object({
  feature: z.string().min(1).max(160),
  price: z.number().nonnegative().nullable().optional(),
  notes: z.string().max(500).optional().or(z.literal('')),
  relatedProjectSlugs: z.array(z.string().min(1).max(160)).max(20).optional(),
});

const freelanceProjectReferenceSchema = z.object({
  slug: z.string().min(1).max(160),
  title: z.string().min(1).max(160),
  notes: z.string().max(500).optional().or(z.literal('')),
});

const freelanceProfileSchema = z.object({
  hourlyRate: z.number().nonnegative().nullable().optional(),
  currency: z.string().min(3).max(8).optional().or(z.literal('')),
  completedProjects: z.number().int().nonnegative().nullable().optional(),
  pricingNotes: z.string().max(2000).optional().or(z.literal('')),
  featurePricing: z.array(freelanceFeaturePriceSchema).max(100).optional(),
  projectReferences: z.array(freelanceProjectReferenceSchema).max(100).optional(),
});

const aboutSkillSchema = z.object({
  name: z.string().min(1).max(100),
  level: z.number().int().min(0).max(100),
  category: z.string().min(1).max(100),
});

export const updateAboutSchema = z.object({
  fullName: z.string().min(2).max(100),
  tagline: z.string().max(200).optional().or(z.literal('')).nullable(),
  roles: z.array(z.string()).max(10),
  shortBio: z.string().optional().or(z.literal('')).nullable(),
  bio: z.string().optional().or(z.literal('')),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal('')).nullable(),
  location: z.string().optional().or(z.literal('')).nullable(),
  avatarUrl: assetValueSchema.optional().or(z.literal('')).nullable(),
  resumeUrl: assetValueSchema.optional().or(z.literal('')).nullable(),
  skills: z.array(aboutSkillSchema).max(50),
  experience: z.array(experienceItemSchema).optional().nullable(),
  freelanceProfile: freelanceProfileSchema.optional().nullable(),
});

export type UpdateAboutInput = z.infer<typeof updateAboutSchema>;
export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type FreelanceFeaturePrice = z.infer<typeof freelanceFeaturePriceSchema>;
export type FreelanceProjectReference = z.infer<typeof freelanceProjectReferenceSchema>;
export type FreelanceProfile = z.infer<typeof freelanceProfileSchema>;
export type AboutSkill = z.infer<typeof aboutSkillSchema>;
