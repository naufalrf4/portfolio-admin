import { relations } from 'drizzle-orm/relations';
import {
  projects,
  projectContexts,
  users,
  accounts,
  sessions,
  projectImages,
  bookingSlots,
  bookings,
  guestbookEntries,
} from './schema';

export const projectContextsRelations = relations(projectContexts, ({ one }) => ({
  project: one(projects, {
    fields: [projectContexts.projectId],
    references: [projects.id],
  }),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  projectContexts: many(projectContexts),
  projectImages: many(projectImages),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  guestbookEntries: many(guestbookEntries),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  project: one(projects, {
    fields: [projectImages.projectId],
    references: [projects.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  bookingSlot: one(bookingSlots, {
    fields: [bookings.slotId],
    references: [bookingSlots.id],
  }),
}));

export const bookingSlotsRelations = relations(bookingSlots, ({ many }) => ({
  bookings: many(bookings),
}));

export const guestbookEntriesRelations = relations(guestbookEntries, ({ one }) => ({
  user: one(users, {
    fields: [guestbookEntries.userId],
    references: [users.id],
  }),
}));
