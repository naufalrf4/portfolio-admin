export interface ProfileLink {
  id: string;
  label: string;
  url: string;
  icon: string | null;
  visible: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormData {
  label: string;
  url: string;
  icon: string;
}

export type ViewMode = 'grid' | 'table';
export type FilterMode = 'all' | 'visible' | 'hidden';
