import { z } from 'zod';

const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

const phoneRegex = /^\+?[1-9]\d{1,14}$/;

export const bookingSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(phoneRegex, 'Invalid phone number format').optional().or(z.literal('')),
  date: z
    .string()
    .datetime()
    .refine((date) => new Date(date) > new Date(), { message: 'Date must be in the future' }),
  time: z.string().regex(timeRegex, 'Time must be in HH:MM format'),
  timezone: z.string().min(1),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

export const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

export const statusUpdateSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED']),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type StatusUpdateInput = z.infer<typeof statusUpdateSchema>;
