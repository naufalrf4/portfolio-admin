import { db } from '@/lib/db';
import { bookingAvailability } from '@/lib/db/schema';
import { and, asc, eq, ne } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

type BookingAvailabilityRecord = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateBookingAvailabilityInput = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  enabled?: boolean;
};

export type UpdateBookingAvailabilityInput = Partial<CreateBookingAvailabilityInput>;

export type BulkUpdateAvailabilityInput = {
  dayOfWeek: number;
  enabled: boolean;
};

export type AvailabilityQueryInput = {
  dayOfWeek?: number;
  enabled?: boolean;
};

type BookingAvailabilityUpdate = Partial<
  Pick<
    typeof bookingAvailability.$inferInsert,
    'dayOfWeek' | 'startTime' | 'endTime' | 'enabled' | 'updatedAt'
  >
>;

export class BookingAvailabilityService {
  async getAll(query: AvailabilityQueryInput) {
    const conditions = [];

    if (query.dayOfWeek !== undefined) {
      conditions.push(eq(bookingAvailability.dayOfWeek, query.dayOfWeek));
    }
    if (query.enabled !== undefined) {
      conditions.push(eq(bookingAvailability.enabled, query.enabled));
    }

    const availabilities = await db
      .select()
      .from(bookingAvailability)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(bookingAvailability.dayOfWeek), asc(bookingAvailability.startTime));

    const groupedByDay = availabilities.reduce<Record<number, typeof availabilities>>(
      (acc, item) => {
        if (!acc[item.dayOfWeek]) {
          acc[item.dayOfWeek] = [];
        }
        acc[item.dayOfWeek].push(item);
        return acc;
      },
      {} as Record<number, typeof availabilities>
    );

    return {
      availabilities,
      groupedByDay,
    };
  }

  async getById(id: string) {
    const result = await db
      .select()
      .from(bookingAvailability)
      .where(eq(bookingAvailability.id, id))
      .limit(1);
    return result[0] || null;
  }

  async create(data: CreateBookingAvailabilityInput) {
    const overlapping = await this.checkOverlap(data.dayOfWeek, data.startTime, data.endTime);
    if (overlapping) {
      throw new Error('Time slot overlaps with existing availability');
    }

    const now = new Date().toISOString();
    const [created] = await db
      .insert(bookingAvailability)
      .values({
        id: createId(),
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        enabled: data.enabled ?? true,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return created;
  }

  async update(id: string, data: UpdateBookingAvailabilityInput) {
    if (data.dayOfWeek !== undefined && data.startTime && data.endTime) {
      const overlapping = await this.checkOverlap(data.dayOfWeek, data.startTime, data.endTime, id);
      if (overlapping) {
        throw new Error('Time slot overlaps with existing availability');
      }
    }

    const now = new Date().toISOString();
    const updateData: BookingAvailabilityUpdate = { ...data, updatedAt: now };
    const [updated] = await db
      .update(bookingAvailability)
      .set(updateData)
      .where(eq(bookingAvailability.id, id))
      .returning();
    return updated;
  }

  async delete(id: string) {
    const [deleted] = await db
      .delete(bookingAvailability)
      .where(eq(bookingAvailability.id, id))
      .returning();
    return deleted;
  }

  async bulkUpdate(data: BulkUpdateAvailabilityInput) {
    const now = new Date().toISOString();
    const result = await db
      .update(bookingAvailability)
      .set({ enabled: data.enabled, updatedAt: now })
      .where(eq(bookingAvailability.dayOfWeek, data.dayOfWeek))
      .returning();
    return { count: result.length };
  }

  private async checkOverlap(
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    excludeId?: string
  ) {
    const conditions = [eq(bookingAvailability.dayOfWeek, dayOfWeek)];
    if (excludeId) {
      conditions.push(ne(bookingAvailability.id, excludeId));
    }

    const existingSlots = await db
      .select()
      .from(bookingAvailability)
      .where(and(...conditions));

    const [newStartHour, newStartMin] = startTime.split(':').map(Number);
    const [newEndHour, newEndMin] = endTime.split(':').map(Number);
    const newStart = newStartHour * 60 + newStartMin;
    const newEnd = newEndHour * 60 + newEndMin;

    return existingSlots.some((slot: BookingAvailabilityRecord) => {
      const [existStartHour, existStartMin] = slot.startTime.split(':').map(Number);
      const [existEndHour, existEndMin] = slot.endTime.split(':').map(Number);
      const existStart = existStartHour * 60 + existStartMin;
      const existEnd = existEndHour * 60 + existEndMin;

      return (
        (newStart >= existStart && newStart < existEnd) ||
        (newEnd > existStart && newEnd <= existEnd) ||
        (newStart <= existStart && newEnd >= existEnd)
      );
    });
  }
}

export const bookingAvailabilityService = new BookingAvailabilityService();
