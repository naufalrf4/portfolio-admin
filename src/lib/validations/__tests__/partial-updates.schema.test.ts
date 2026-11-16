import { describe, expect, test } from 'bun:test';
import { updateAchievementSchema } from '../achievement.schema';
import { updateBlogLinkSchema } from '../blog-link.schema';
import { updateBookingAvailabilitySchema } from '../booking-availability.schema';
import { createBookingSlotSchema } from '../booking-slots.schema';
import { updateProfileLinkSchema } from '../profile-link.schema';

describe('partial update schemas', () => {
  test('does not apply create defaults to achievement updates', () => {
    expect(updateAchievementSchema.parse({ description: 'Updated' })).toEqual({
      description: 'Updated',
    });
  });

  test('does not apply create defaults to blog link updates', () => {
    expect(updateBlogLinkSchema.parse({ title: 'Updated' })).toEqual({ title: 'Updated' });
  });

  test('does not apply create defaults to profile link updates', () => {
    expect(updateProfileLinkSchema.parse({ label: 'Updated' })).toEqual({ label: 'Updated' });
  });

  test('does not apply create defaults to booking availability updates', () => {
    expect(updateBookingAvailabilitySchema.parse({ startTime: '10:00' })).toEqual({
      startTime: '10:00',
    });
  });

  test('rejects impossible calendar dates for booking slots', () => {
    expect(
      createBookingSlotSchema.safeParse({ date: '2026-02-31', time: '10:00', duration: 60 }).success
    ).toBe(false);
  });

  test('rejects booking availability ranges that end before they start', () => {
    expect(
      updateBookingAvailabilitySchema.safeParse({ startTime: '16:00', endTime: '10:00' }).success
    ).toBe(false);
  });
});
