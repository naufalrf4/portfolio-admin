import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { bookings } from '@/lib/db/schema';
import {
  successResponse,
  validationErrorResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { emailService } from '@/lib/services/emailService';
import {
  googleCalendarService,
  GoogleCalendarAuthError,
} from '@/lib/services/googleCalendarService';
import { bookingSettingsService } from '@/lib/api/handlers/booking-settings.service';
import { notificationService } from '@/lib/services/notificationService';
import { logger } from '@/lib/utils/logger';
import { formatJakartaDateKeyLabel } from '@/lib/utils/date';

const updateBookingStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED']),
  message: z.string().optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

type BookingStatusUpdate = Partial<
  Pick<typeof bookings.$inferInsert, 'status' | 'updatedAt' | 'metadata'>
>;

function readBookingMetadata(metadata: unknown) {
  return metadata && typeof metadata === 'object' ? metadata : {};
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return withAdminAuth(async () => {
    try {
      const { id } = await context.params;
      const body = await request.json();
      const parsed = updateBookingStatusSchema.safeParse(body);

      if (!parsed.success) {
        return validationErrorResponse(parsed.error.flatten().fieldErrors);
      }

      const bookingResult = await db.query.bookings.findFirst({
        where: eq(bookings.id, id),
        with: { bookingSlot: true },
      });

      if (!bookingResult) {
        return errorResponse('Booking not found', 404);
      }

      const now = new Date().toISOString();
      const metadata = readBookingMetadata(bookingResult.metadata);
      const bookingSettings = await bookingSettingsService.getInternal();
      let calendarEvent: Awaited<ReturnType<typeof googleCalendarService.createBookingEvent>> =
        null;

      if (parsed.data.status === 'CONFIRMED' && bookingResult.bookingSlot) {
        calendarEvent = await googleCalendarService.createBookingEvent({
          booking: bookingResult,
          slot: bookingResult.bookingSlot,
          message: parsed.data.message,
          settings: bookingSettings,
        });
      }

      if (parsed.data.status === 'CANCELLED' && 'googleCalendarEventId' in metadata) {
        const eventId = metadata.googleCalendarEventId;
        if (typeof eventId === 'string' && eventId) {
          await googleCalendarService.cancelBookingEvent(eventId, bookingSettings);
        }
      }

      const nextMetadata = {
        ...metadata,
        ...(calendarEvent
          ? {
              googleCalendarEventId: calendarEvent.eventId,
              googleCalendarUrl: calendarEvent.calendarUrl,
              googleMeetUrl: calendarEvent.meetUrl,
            }
          : {}),
      };

      const updateData: BookingStatusUpdate = {
        status: parsed.data.status,
        updatedAt: now,
        metadata: nextMetadata,
      };
      const [updated] = await db
        .update(bookings)
        .set(updateData)
        .where(eq(bookings.id, id))
        .returning();

      const slot = bookingResult.bookingSlot!;

      const dateFormatted = formatJakartaDateKeyLabel(slot.date);

      try {
        if (parsed.data.status === 'CONFIRMED') {
          await emailService.sendBookingConfirmed(updated.email, {
            bookingId: updated.id,
            name: updated.name,
            date: dateFormatted,
            time: slot.time,
            duration: slot.duration,
            message: parsed.data.message || 'Your booking has been confirmed!',
            calendarUrl: calendarEvent?.calendarUrl ?? null,
            meetUrl: calendarEvent?.meetUrl ?? null,
            status: 'confirmed',
          });
        } else if (parsed.data.status === 'CANCELLED') {
          await emailService.sendBookingRejected(updated.email, {
            bookingId: updated.id,
            name: updated.name,
            date: dateFormatted,
            time: slot.time,
            duration: slot.duration,
            message: parsed.data.message || 'Your booking could not be confirmed at this time.',
            status: 'rejected',
          });
        }
      } catch (emailError) {
        logger.error('[Booking Status Update] Email failed', emailError);
      }

      void notificationService.enqueue('booking.status_changed', {
        name: updated.name,
        previousStatus: bookingResult.status,
        status: updated.status,
        date: slot.date,
        time: slot.time,
      });

      return successResponse(
        {
          id: updated.id,
          status: updated.status,
          date: dateFormatted,
          time: slot.time,
          googleCalendarUrl: calendarEvent?.calendarUrl ?? null,
          googleMeetUrl: calendarEvent?.meetUrl ?? null,
        },
        `Booking ${parsed.data.status.toLowerCase()}`
      );
    } catch (error) {
      if (error instanceof SyntaxError) {
        return errorResponse('Invalid JSON body', 400);
      }
      if (error instanceof GoogleCalendarAuthError) {
        return errorResponse(
          'Google Calendar authorization has been revoked. Please reconnect in booking settings.',
          409,
          'GOOGLE_CALENDAR_REAUTH_REQUIRED'
        );
      }
      return serverErrorResponse();
    }
  })(request);
}

export const PATCH = PUT;
