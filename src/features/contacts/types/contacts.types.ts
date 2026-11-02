export interface ContactForm {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  ipHash: string;
  metadata?: {
    reply?: {
      subject: string;
      message: string;
      repliedAt: string;
    };
  } | null;
  read: boolean;
  replied: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactSettings {
  id: string;
  enabled: boolean;
  requireEmail: boolean;
  requireSubject: boolean;
  maxMessageLength: number;
  enableAutoReply: boolean;
  autoReplySubject: string | null;
  autoReplyMessage: string | null;
  notificationEmail: string | null;
  enableRateLimiting: boolean;
  rateLimitPerHour: number;
  enableSpamProtection: boolean;
  blockedKeywords: string[];
}

export interface ContactSettingsForm {
  notificationEmail: string | null;
  blockedKeywords: string[];
}

export type FilterMode = 'all' | 'unread' | 'read';

export type BulkAction = 'markRead' | 'markUnread' | 'delete';

export interface ContactsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FetchContactsParams {
  page?: number;
  limit?: number;
  read?: boolean;
}

export interface UseContactsOptions {
  enabled?: boolean;
  initialPage?: number;
  initialLimit?: number;
  initialFilter?: FilterMode;
}

export interface UseContactsResult {
  contacts: ContactForm[];
  loading: boolean;
  pagination: ContactsPagination;
  unreadCount: number;
  filterMode: FilterMode;
  setFilterMode: (mode: FilterMode) => void;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
  getContact: (id: string) => Promise<ContactForm | null>;
  updateContact: (id: string, data: Partial<ContactForm>) => Promise<boolean>;
  deleteContact: (id: string) => Promise<boolean>;
  toggleReadStatus: (contact: ContactForm) => Promise<boolean>;
  bulkAction: (ids: string[], action: BulkAction) => Promise<boolean>;
}

export interface UseContactSettingsResult {
  settings: ContactSettings | null;
  loading: boolean;
  saving: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateSettings: (data: Partial<ContactSettings>) => Promise<boolean>;
}
