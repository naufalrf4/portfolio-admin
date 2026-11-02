export interface ProjectEdit {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  summary: string | null;
  description: string | null;
  category: string;
  techStack: string[];
  liveUrl: string | null;
  repoUrl: string | null;
  featured: boolean;
  visible: boolean;
  order: number;
}

export interface ProjectImage {
  id: string;
  url: string;
  key: string;
  caption: string | null;
  alt: string | null;
  order: number;
}
