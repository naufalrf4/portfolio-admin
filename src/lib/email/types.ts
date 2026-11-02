export interface ContactConfirmationData {
  name: string;
  subject?: string | null;
  messageId: string;
  receivedAt: string;
}

export interface AdminContactNotificationData {
  contact: {
    id: string;
    name: string;
    email: string;
    subject?: string | null;
    message: string;
    country?: string | null;
    city?: string | null;
  };
  dashboardLink: string;
  replyLink: string;
  receivedAt: string;
}

export interface ContactReplyData {
  name: string;
  replySubject: string;
  replyMessage: string;
  originalMessage: string;
  dashboardLink: string;
}

export interface BookingConfirmationData {
  bookingId: string;
  name: string;
  date: string;
  time: string;
  duration: number;
}

export interface AdminBookingNotificationData {
  booking: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    date: string;
    time: string;
    notes?: string | null;
  };
  dashboardLink: string;
  acceptLink: string;
  rejectLink: string;
}

export interface BookingStatusUpdateData {
  bookingId: string;
  name: string;
  date: string;
  time: string;
  duration: number;
  message?: string;
  calendarUrl?: string | null;
  meetUrl?: string | null;
  status: 'confirmed' | 'rejected';
}
