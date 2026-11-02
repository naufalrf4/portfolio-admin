import {
  pgTable,
  varchar,
  timestamp,
  text,
  integer,
  index,
  uniqueIndex,
  jsonb,
  boolean,
  unique,
  foreignKey,
  date,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const bookingStatus = pgEnum('BookingStatus', [
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
]);
export const projectContextType = pgEnum('ProjectContextType', [
  'CONTEXT',
  'ROLE',
  'DECISIONS',
  'TRADEOFFS',
  'RESULT',
  'ARCHITECTURE',
  'OPERATIONS',
  'METRICS',
]);
export const slotStatus = pgEnum('SlotStatus', ['AVAILABLE', 'BOOKED', 'BLOCKED']);
export const userRole = pgEnum('UserRole', ['ADMIN', 'USER']);

export const prismaMigrations = pgTable('_prisma_migrations', {
  id: varchar({ length: 36 }).primaryKey().notNull(),
  checksum: varchar({ length: 64 }).notNull(),
  finishedAt: timestamp('finished_at', { withTimezone: true, mode: 'string' }),
  migrationName: varchar('migration_name', { length: 255 }).notNull(),
  logs: text(),
  rolledBackAt: timestamp('rolled_back_at', { withTimezone: true, mode: 'string' }),
  startedAt: timestamp('started_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  appliedStepsCount: integer('applied_steps_count').default(0).notNull(),
});

export const chatLogs = pgTable(
  'chat_logs',
  {
    id: text().primaryKey().notNull(),
    sessionId: text().notNull(),
    messages: jsonb().default([]).notNull(),
    createdAt: timestamp({ precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
  },
  (table) => [
    index('chat_logs_createdAt_idx').using(
      'btree',
      table.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    index('chat_logs_sessionId_idx').using(
      'btree',
      table.sessionId.asc().nullsLast().op('text_ops')
    ),
    uniqueIndex('chat_logs_sessionId_key').using(
      'btree',
      table.sessionId.asc().nullsLast().op('text_ops')
    ),
  ]
);

export const profileLinks = pgTable(
  'profile_links',
  {
    id: text().primaryKey().notNull(),
    label: text().notNull(),
    url: text().notNull(),
    icon: text(),
    visible: boolean().default(true).notNull(),
    order: integer().default(0).notNull(),
    createdAt: timestamp({ precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
  },
  (table) => [
    index('profile_links_order_idx').using('btree', table.order.asc().nullsLast().op('int4_ops')),
    index('profile_links_visible_idx').using(
      'btree',
      table.visible.asc().nullsLast().op('bool_ops')
    ),
  ]
);

export const knowledgeDocs = pgTable(
  'knowledge_docs',
  {
    id: text().primaryKey().notNull(),
    filename: text().notNull(),
    content: text().notNull(),
    indexed: boolean().default(false).notNull(),
    createdAt: timestamp({ precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
  },
  (table) => [
    index('knowledge_docs_filename_idx').using(
      'btree',
      table.filename.asc().nullsLast().op('text_ops')
    ),
    uniqueIndex('knowledge_docs_filename_key').using(
      'btree',
      table.filename.asc().nullsLast().op('text_ops')
    ),
    index('knowledge_docs_indexed_idx').using(
      'btree',
      table.indexed.asc().nullsLast().op('bool_ops')
    ),
    unique('knowledge_docs_filename_unique').on(table.filename),
  ]
);

export const projectContexts = pgTable(
  'project_contexts',
  {
    id: text().primaryKey().notNull(),
    projectId: text().notNull(),
    type: projectContextType().notNull(),
    title: text().notNull(),
    content: text().notNull(),
    order: integer().default(0).notNull(),
    createdAt: timestamp({ precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
  },
  (table) => [
    index('project_contexts_order_idx').using(
      'btree',
      table.order.asc().nullsLast().op('int4_ops')
    ),
    index('project_contexts_projectId_idx').using(
      'btree',
      table.projectId.asc().nullsLast().op('text_ops')
    ),
    index('project_contexts_type_idx').using('btree', table.type.asc().nullsLast().op('enum_ops')),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: 'project_contexts_projectId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ]
);

export const users = pgTable(
  'users',
  {
    id: text().primaryKey().notNull(),
    email: text().notNull(),
    name: text(),
    image: text(),
    role: userRole().default('USER').notNull(),
    createdAt: timestamp({ precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
  },
  (table) => [
    uniqueIndex('users_email_key').using('btree', table.email.asc().nullsLast().op('text_ops')),
    unique('users_email_unique').on(table.email),
  ]
);

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text().notNull(),
    token: text().notNull(),
    expires: timestamp({ precision: 3, mode: 'string' }).notNull(),
  },
  (table) => [
    uniqueIndex('verification_tokens_identifier_token_key').using(
      'btree',
      table.identifier.asc().nullsLast().op('text_ops'),
      table.token.asc().nullsLast().op('text_ops')
    ),
    uniqueIndex('verification_tokens_token_key').using(
      'btree',
      table.token.asc().nullsLast().op('text_ops')
    ),
    unique('verification_tokens_token_unique').on(table.token),
  ]
);

export const contactSettings = pgTable('contact_settings', {
  id: text().primaryKey().notNull(),
  notificationEmail: text(),
  blockedKeywords: text().array(),
  createdAt: timestamp({ precision: 3, mode: 'string' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
});

export const bookingSettings = pgTable('booking_settings', {
  id: text().primaryKey().notNull(),
  notificationEmail: text(),
  reminderEnabled: boolean().default(true).notNull(),
  reminderDay: integer().default(6).notNull(),
  reminderTime: text().default('09:00').notNull(),
  timezone: text().default('Asia/Jakarta').notNull(),
  createdAt: timestamp({ precision: 3, mode: 'string' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
});

export const bookingAvailability = pgTable(
  'booking_availability',
  {
    id: text().primaryKey().notNull(),
    dayOfWeek: integer().notNull(),
    startTime: text().notNull(),
    endTime: text().notNull(),
    enabled: boolean().default(true).notNull(),
    createdAt: timestamp({ precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
  },
  (table) => [
    index('booking_availability_dayOfWeek_idx').using(
      'btree',
      table.dayOfWeek.asc().nullsLast().op('int4_ops')
    ),
    uniqueIndex('booking_availability_dayOfWeek_startTime_endTime_key').using(
      'btree',
      table.dayOfWeek.asc().nullsLast().op('int4_ops'),
      table.startTime.asc().nullsLast().op('int4_ops'),
      table.endTime.asc().nullsLast().op('text_ops')
    ),
    index('booking_availability_enabled_idx').using(
      'btree',
      table.enabled.asc().nullsLast().op('bool_ops')
    ),
  ]
);

export const accounts = pgTable(
  'accounts',
  {
    id: text().primaryKey().notNull(),
    userId: text().notNull(),
    type: text().notNull(),
    provider: text().notNull(),
    providerAccountId: text().notNull(),
    refreshToken: text('refresh_token'),
    accessToken: text('access_token'),
    expiresAt: integer('expires_at'),
    tokenType: text('token_type'),
    scope: text(),
    idToken: text('id_token'),
    sessionState: text('session_state'),
  },
  (table) => [
    uniqueIndex('accounts_provider_providerAccountId_key').using(
      'btree',
      table.provider.asc().nullsLast().op('text_ops'),
      table.providerAccountId.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'accounts_userId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ]
);

export const sessions = pgTable(
  'sessions',
  {
    id: text().primaryKey().notNull(),
    sessionToken: text().notNull(),
    userId: text().notNull(),
    expires: timestamp({ precision: 3, mode: 'string' }).notNull(),
  },
  (table) => [
    uniqueIndex('sessions_sessionToken_key').using(
      'btree',
      table.sessionToken.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'sessions_userId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ]
);

export const projectImages = pgTable(
  'project_images',
  {
    id: text().primaryKey().notNull(),
    projectId: text().notNull(),
    url: text().notNull(),
    key: text().notNull(),
    order: integer().default(0).notNull(),
    caption: text(),
    alt: text(),
    createdAt: timestamp({ precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('project_images_order_idx').using('btree', table.order.asc().nullsLast().op('int4_ops')),
    index('project_images_projectId_idx').using(
      'btree',
      table.projectId.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: 'project_images_projectId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ]
);

export const bookingSlots = pgTable(
  'booking_slots',
  {
    id: text().primaryKey().notNull(),
    date: date().notNull(),
    time: text().notNull(),
    duration: integer().default(60).notNull(),
    status: slotStatus().default('AVAILABLE').notNull(),
    createdAt: timestamp({ precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
  },
  (table) => [
    index('booking_slots_date_status_idx').using(
      'btree',
      table.date.asc().nullsLast().op('date_ops'),
      table.status.asc().nullsLast().op('date_ops')
    ),
    uniqueIndex('booking_slots_date_time_key').using(
      'btree',
      table.date.asc().nullsLast().op('text_ops'),
      table.time.asc().nullsLast().op('text_ops')
    ),
  ]
);

export const anonymousMessages = pgTable(
  'anonymous_messages',
  {
    id: text().primaryKey().notNull(),
    content: text().notNull(),
    ipHash: text().notNull(),
    read: boolean().default(false).notNull(),
    createdAt: timestamp({ precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
    city: text(),
    country: text(),
    countryCode: text(),
    ipAddress: text(),
    region: text(),
  },
  (table) => [
    index('anonymous_messages_city_idx').using(
      'btree',
      table.city.asc().nullsLast().op('text_ops')
    ),
    index('anonymous_messages_countryCode_idx').using(
      'btree',
      table.countryCode.asc().nullsLast().op('text_ops')
    ),
    index('anonymous_messages_createdAt_idx').using(
      'btree',
      table.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    index('anonymous_messages_read_idx').using(
      'btree',
      table.read.asc().nullsLast().op('bool_ops')
    ),
  ]
);

export const analyticsEvents = pgTable(
  'analytics_events',
  {
    id: text().primaryKey().notNull(),
    page: varchar({ length: 100 }).notNull(),
    entityType: varchar({ length: 50 }).notNull(),
    entityId: text(),
    eventType: varchar({ length: 20 }).notNull(),
    data: jsonb(),
    userSession: text(),
    ipAddress: varchar({ length: 45 }),
    countryCode: varchar({ length: 2 }),
    city: varchar({ length: 100 }),
    createdAt: timestamp({ precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('analytics_events_createdAt_idx').using(
      'btree',
      table.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    index('analytics_events_entityType_entityId_idx').using(
      'btree',
      table.entityType.asc().nullsLast().op('text_ops'),
      table.entityId.asc().nullsLast().op('text_ops')
    ),
    index('analytics_events_eventType_idx').using(
      'btree',
      table.eventType.asc().nullsLast().op('text_ops')
    ),
    index('analytics_events_page_idx').using('btree', table.page.asc().nullsLast().op('text_ops')),
  ]
);

export const bookings = pgTable(
  'bookings',
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    phone: text(),
    notes: text(),
    status: bookingStatus().default('PENDING').notNull(),
    slotId: text(),
    ipHash: text().notNull(),
    createdAt: timestamp({ precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
    city: text(),
    country: text(),
    countryCode: text(),
    ipAddress: text(),
    region: text(),
  },
  (table) => [
    index('bookings_countryCode_idx').using(
      'btree',
      table.countryCode.asc().nullsLast().op('text_ops')
    ),
    index('bookings_createdAt_idx').using(
      'btree',
      table.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    uniqueIndex('bookings_slotId_key').using(
      'btree',
      table.slotId.asc().nullsLast().op('text_ops')
    ),
    index('bookings_status_idx').using('btree', table.status.asc().nullsLast().op('enum_ops')),
    foreignKey({
      columns: [table.slotId],
      foreignColumns: [bookingSlots.id],
      name: 'bookings_slotId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
  ]
);

export const contactForms = pgTable(
  'contact_forms',
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    subject: text(),
    message: text().notNull(),
    ipHash: text().notNull(),
    read: boolean().default(false).notNull(),
    replied: boolean().default(false).notNull(),
    createdAt: timestamp({ precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
    city: text(),
    country: text(),
    countryCode: text(),
    ipAddress: text(),
    region: text(),
  },
  (table) => [
    index('contact_forms_countryCode_idx').using(
      'btree',
      table.countryCode.asc().nullsLast().op('text_ops')
    ),
    index('contact_forms_createdAt_idx').using(
      'btree',
      table.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    index('contact_forms_read_idx').using('btree', table.read.asc().nullsLast().op('bool_ops')),
  ]
);

export const guestbookEntries = pgTable(
  'guestbook_entries',
  {
    id: text().primaryKey().notNull(),
    userId: text().notNull(),
    message: text().notNull(),
    reactions: jsonb().default([]).notNull(),
    visible: boolean().default(true).notNull(),
    createdAt: timestamp({ precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
    city: text(),
    country: text(),
    countryCode: text(),
    ipAddress: text(),
    region: text(),
  },
  (table) => [
    index('guestbook_entries_countryCode_idx').using(
      'btree',
      table.countryCode.asc().nullsLast().op('text_ops')
    ),
    index('guestbook_entries_createdAt_idx').using(
      'btree',
      table.createdAt.asc().nullsLast().op('timestamp_ops')
    ),
    index('guestbook_entries_userId_idx').using(
      'btree',
      table.userId.asc().nullsLast().op('text_ops')
    ),
    index('guestbook_entries_visible_idx').using(
      'btree',
      table.visible.asc().nullsLast().op('bool_ops')
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'guestbook_entries_userId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ]
);

export const projects = pgTable(
  'projects',
  {
    id: text().primaryKey().notNull(),
    title: text().notNull(),
    slug: text().notNull(),
    summary: text().notNull(),
    description: text().notNull(),
    category: text().notNull(),
    techStack: text().array(),
    liveUrl: text(),
    repoUrl: text(),
    imageUrl: text(),
    featured: boolean().default(false).notNull(),
    visible: boolean().default(true).notNull(),
    order: integer().default(0).notNull(),
    createdAt: timestamp({ precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
    content: text(),
    thumbnailId: text(),
    endDate: timestamp({ precision: 3, mode: 'string' }),
    projectDate: text(),
    startDate: timestamp({ precision: 3, mode: 'string' }),
    tags: text().array(),
  },
  (table) => [
    index('projects_category_idx').using('btree', table.category.asc().nullsLast().op('text_ops')),
    index('projects_featured_idx').using('btree', table.featured.asc().nullsLast().op('bool_ops')),
    index('projects_order_idx').using('btree', table.order.asc().nullsLast().op('int4_ops')),
    index('projects_slug_idx').using('btree', table.slug.asc().nullsLast().op('text_ops')),
    uniqueIndex('projects_slug_key').using('btree', table.slug.asc().nullsLast().op('text_ops')),
    index('projects_visible_idx').using('btree', table.visible.asc().nullsLast().op('bool_ops')),
    unique('projects_slug_unique').on(table.slug),
  ]
);

export const blogLink = pgTable('BlogLink', {
  id: text().primaryKey().notNull(),
  url: text().notNull(),
  title: text().notNull(),
  description: text(),
  imageUrl: text(),
  source: text().notNull(),
  category: text(),
  tags: text().array(),
  publishedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
  visible: boolean().default(true).notNull(),
  order: integer().default(0).notNull(),
  createdAt: timestamp({ precision: 3, mode: 'string' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
});

export const aboutMe = pgTable('AboutMe', {
  id: text().primaryKey().notNull(),
  fullName: text().notNull(),
  tagline: text().notNull(),
  roles: text().array(),
  bio: text().notNull(),
  email: text().notNull(),
  phone: text(),
  location: text(),
  avatarUrl: text(),
  resumeUrl: text(),
  availabilityStatus: text(),
  skills: text().array(),
  experience: jsonb(),
  socialLinks: jsonb(),
  createdAt: timestamp({ precision: 3, mode: 'string' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
});

export const achievements = pgTable(
  'achievements',
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    location: text().notNull(),
    monthYear: text().notNull(),
    photos: text().array(),
    description: text().notNull(),
    externalUrl: text(),
    order: integer().default(0).notNull(),
    visible: boolean().default(true).notNull(),
    createdAt: timestamp({ precision: 3, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
  },
  (table) => [
    index('achievements_order_idx').using('btree', table.order.asc().nullsLast().op('int4_ops')),
    index('achievements_visible_idx').using(
      'btree',
      table.visible.asc().nullsLast().op('bool_ops')
    ),
  ]
);
