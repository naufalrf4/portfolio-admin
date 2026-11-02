export interface GuestbookUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export interface GuestbookEntry {
  id: string;
  userId: string;
  message: string;
  reactions: Array<{ userId: string; emoji: string }>;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
  user: GuestbookUser;
}

export type FilterType = 'all' | 'visible' | 'hidden';
