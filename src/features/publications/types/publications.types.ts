export interface PublicationLink {
  id: string;
  url: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  source: string;
  publishedAt: Date | null;
  visible: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type FilterType = 'all' | 'visible' | 'hidden';
