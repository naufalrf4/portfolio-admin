export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'BLOCKED';

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  date: string;
  time: string;
  timezone: string;
  notes: string | null;
  calendarUrl?: string | null;
  meetUrl?: string | null;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BookingSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: SlotStatus;
  bookerName?: string;
  bookerEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingAvailability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingSettings {
  id?: string;
  notificationEmail?: string | null;
  reminderEnabled?: boolean;
  reminderDay?: number;
  reminderTime?: string;
  timezone: string;
  googleCalendarRefreshToken?: string | null;
  googleCalendarCalendarId?: string | null;
  googleCalendarCalendarName?: string | null;
  googleCalendarConnectedEmail?: string | null;
  googleCalendarConnectedAt?: string | null;
  googleCalendarGrantedScopes?: string[] | null;
  googleCalendarConnected?: boolean;
}

export interface GoogleCalendarOption {
  id: string;
  summary: string;
  primary: boolean;
  accessRole: string | null;
}

export type FilterType = 'all' | BookingStatus;

export interface BookingsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FetchBookingsParams {
  page?: number;
  limit?: number;
  status?: BookingStatus;
}

export interface UseBookingsOptions {
  enabled?: boolean;
  initialPage?: number;
  initialLimit?: number;
  initialFilter?: FilterType;
}

export interface UseBookingsResult {
  bookings: Booking[];
  loading: boolean;
  pagination: BookingsPagination;
  pendingCount: number;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
  getBooking: (id: string) => Promise<Booking | null>;
  updateStatus: (id: string, status: BookingStatus) => Promise<boolean>;
  deleteBooking: (id: string) => Promise<boolean>;
}

export interface CreateSlotInput {
  date: string;
  startTime: string;
  endTime: string;
  status?: SlotStatus;
}

export interface UpdateSlotInput {
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: SlotStatus;
}

export interface BulkCreateSlotsInput {
  slots: CreateSlotInput[];
}

export interface UseAvailabilityOptions {
  enabled?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UseAvailabilityResult {
  slots: BookingSlot[];
  settings: BookingSettings | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createSlot: (input: CreateSlotInput) => Promise<boolean>;
  updateSlot: (id: string, input: UpdateSlotInput) => Promise<boolean>;
  deleteSlot: (id: string) => Promise<boolean>;
  toggleSlotStatus: (slot: BookingSlot) => Promise<boolean>;
  bulkCreateSlots: (input: BulkCreateSlotsInput) => Promise<boolean>;
  copyFromLastWeek: (sourceStartDate: string, targetStartDate: string) => Promise<boolean>;
  saveSettings: (settings: Partial<BookingSettings>) => Promise<boolean>;
}
