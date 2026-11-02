export interface AnonymousMessage {
  id: string;
  content: string;
  ipHash: string;
  ipAddress?: string;
  countryCode?: string;
  country?: string;
  city?: string;
  region?: string;
  read: boolean;
  createdAt: string;
}

export type FilterTab = 'all' | 'unread' | 'read';
