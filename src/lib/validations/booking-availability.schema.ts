import { z } from 'zod';

const bookingAvailabilityFields = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  enabled: z.boolean().optional().default(true),
});

export const createBookingAvailabilitySchema = bookingAvailabilityFields.refine((value) => value.endTime > value.startTime, {
  message: 'End time must be later than start time',
  path: ['endTime'],
});

export const updateBookingAvailabilitySchema = bookingAvailabilityFields.partial().extend({
  enabled: z.boolean().optional(),
}).refine((value) =>
  value.startTime === undefined || value.endTime === undefined || value.endTime > value.startTime,
{
  message: 'End time must be later than start time',
  path: ['endTime'],
});

export const bulkUpdateAvailabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  enabled: z.boolean(),
});

export const availabilityQuerySchema = z.object({
  dayOfWeek: z.coerce.number().min(0).max(6).optional(),
  enabled: z.coerce.boolean().optional(),
});

export type CreateBookingAvailabilityInput = z.infer<typeof createBookingAvailabilitySchema>;
export type UpdateBookingAvailabilityInput = z.infer<typeof updateBookingAvailabilitySchema>;
export type BulkUpdateAvailabilityInput = z.infer<typeof bulkUpdateAvailabilitySchema>;
export type AvailabilityQueryInput = z.infer<typeof availabilityQuerySchema>;
