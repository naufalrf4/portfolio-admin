import { relations } from 'drizzle-orm';
import {
  users,
  accounts,
  sessions,
  projects,
  projectImages,
  guestbookEntries,
  bookingSlots,
  bookings,
} from './schema';

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  guestbookEntries: many(guestbookEntries),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const guestbookEntriesRelations = relations(guestbookEntries, ({ one }) => ({
  user: one(users, {
    fields: [guestbookEntries.userId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  projectImages: many(projectImages),
}));

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  project: one(projects, {
    fields: [projectImages.projectId],
    references: [projects.id],
  }),
}));

export const bookingSlotsRelations = relations(bookingSlots, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingSlots.id],
    references: [bookings.slotId],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  bookingSlot: one(bookingSlots, {
    fields: [bookings.slotId],
    references: [bookingSlots.id],
  }),
}));
