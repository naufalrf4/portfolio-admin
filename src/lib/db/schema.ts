import {
  pgTable,
  pgSchema,
  varchar,
  timestamp,
  text,
  integer,
  bigint,
  index,
  uniqueIndex,
  jsonb,
  boolean,
  unique,
  foreignKey,
  date,
  pgEnum,
  customType,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const bookingStatus = pgEnum('BookingStatus', [
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
]);
export const slotStatus = pgEnum('SlotStatus', ['AVAILABLE', 'BOOKED', 'BLOCKED']);
export const userRole = pgEnum('UserRole', ['ADMIN', 'USER']);

const rag = pgSchema('rag');

const vector = customType<{
  data: number[];
  driverData: string;
  config: { dimensions: number };
}>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 1536})`;
  },
  toDriver(value) {
    return `[${value.join(',')}]`;
  },
});

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
    createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
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
    createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
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
    createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
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

export const users = pgTable(
  'users',
  {
    id: text().primaryKey().notNull(),
    email: text().notNull(),
    name: text(),
    image: text(),
    role: userRole().default('USER').notNull(),
    createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
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
    expires: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
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
  createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
});

export const bookingSettings = pgTable('booking_settings', {
  id: text().primaryKey().notNull(),
  notificationEmail: text(),
  reminderEnabled: boolean().default(true).notNull(),
  reminderDay: integer().default(6).notNull(),
  reminderTime: text().default('09:00').notNull(),
  timezone: text().default('Asia/Jakarta').notNull(),
  googleCalendarRefreshToken: text('google_calendar_refresh_token'),
  googleCalendarCalendarId: text('google_calendar_calendar_id'),
  googleCalendarCalendarName: text('google_calendar_calendar_name'),
  googleCalendarConnectedEmail: text('google_calendar_connected_email'),
  googleCalendarGrantedScopes: text('google_calendar_granted_scopes').array(),
  googleCalendarConnectedAt: timestamp('google_calendar_connected_at', {
    precision: 3,
    withTimezone: true,
    mode: 'string',
  }),
  createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
});

export const bookingAvailability = pgTable(
  'booking_availability',
  {
    id: text().primaryKey().notNull(),
    dayOfWeek: integer().notNull(),
    startTime: text().notNull(),
    endTime: text().notNull(),
    enabled: boolean().default(true).notNull(),
    createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
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
    expires: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
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

export const ragDocuments = rag.table(
  'documents',
  {
    id: uuid().primaryKey().defaultRandom().notNull(),
    sourceType: varchar('source_type', { length: 32 }).notNull(),
    sourceRef: varchar('source_ref', { length: 255 }).notNull(),
    title: varchar({ length: 255 }).notNull(),
    visibility: varchar({ length: 32 }).default('private').notNull(),
    sensitivity: varchar({ length: 32 }).default('normal').notNull(),
    storageKey: varchar('storage_key', { length: 512 }),
    mimeType: varchar('mime_type', { length: 128 }),
    status: varchar({ length: 32 }).default('pending').notNull(),
    tags: jsonb()
      .default(sql`'[]'::jsonb`)
      .notNull(),
    metadata: jsonb()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    contentHash: varchar('content_hash', { length: 64 }),
    contentExcerpt: text('content_excerpt'),
    lastIngestedAt: timestamp('last_ingested_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    unique('uq_rag_documents_source').on(table.sourceType, table.sourceRef),
    index('ix_rag_documents_source_ref').using(
      'btree',
      table.sourceRef.asc().nullsLast().op('text_ops')
    ),
    index('ix_rag_documents_visibility').using(
      'btree',
      table.visibility.asc().nullsLast().op('text_ops')
    ),
    index('ix_rag_documents_status').using('btree', table.status.asc().nullsLast().op('text_ops')),
  ]
);

export const ragChunks = rag.table(
  'chunks',
  {
    id: uuid().primaryKey().defaultRandom().notNull(),
    documentId: uuid('document_id').notNull(),
    chunkIndex: integer('chunk_index').notNull(),
    sourceType: varchar('source_type', { length: 32 }).notNull(),
    sourceRef: varchar('source_ref', { length: 255 }).notNull(),
    visibility: varchar({ length: 32 }).default('private').notNull(),
    content: text().notNull(),
    contextualContent: text('contextual_content').notNull(),
    tokenCount: integer('token_count').notNull(),
    checksum: varchar({ length: 64 }).notNull(),
    metadata: jsonb()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    unique('uq_rag_chunks_document_index').on(table.documentId, table.chunkIndex),
    index('ix_rag_chunks_document_id').using(
      'btree',
      table.documentId.asc().nullsLast().op('uuid_ops')
    ),
    index('ix_rag_chunks_source_ref').using(
      'btree',
      table.sourceRef.asc().nullsLast().op('text_ops')
    ),
    index('ix_rag_chunks_visibility').using(
      'btree',
      table.visibility.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [table.documentId],
      foreignColumns: [ragDocuments.id],
      name: 'rag_chunks_document_id_fkey',
    }).onDelete('cascade'),
  ]
);

export const ragStagedActions = rag.table(
  'staged_actions',
  {
    id: uuid().primaryKey().defaultRandom().notNull(),
    sessionId: varchar('session_id', { length: 64 }).notNull(),
    tool: varchar({ length: 64 }).notNull(),
    payload: jsonb()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    description: text().notNull(),
    consumedAt: timestamp('consumed_at', { withTimezone: true, mode: 'string' }),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('ix_rag_staged_actions_session_id').using(
      'btree',
      table.sessionId.asc().nullsLast().op('text_ops')
    ),
    index('ix_rag_staged_actions_expires_at').using(
      'btree',
      table.expiresAt.asc().nullsLast().op('timestamptz_ops')
    ),
  ]
);

export const ragIngestionRuns = rag.table(
  'ingestion_runs',
  {
    id: uuid().primaryKey().defaultRandom().notNull(),
    documentId: uuid('document_id'),
    triggerType: varchar('trigger_type', { length: 32 }).notNull(),
    requestPayload: jsonb('request_payload')
      .default(sql`'{}'::jsonb`)
      .notNull(),
    status: varchar({ length: 32 }).default('pending').notNull(),
    chunksWritten: integer('chunks_written').default(0).notNull(),
    errorMessage: text('error_message'),
    startedAt: timestamp('started_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('ix_rag_ingestion_runs_document_id').using(
      'btree',
      table.documentId.asc().nullsLast().op('uuid_ops')
    ),
    index('ix_rag_ingestion_runs_status').using(
      'btree',
      table.status.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [table.documentId],
      foreignColumns: [ragDocuments.id],
      name: 'rag_ingestion_runs_document_id_fkey',
    }).onDelete('set null'),
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
    createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
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
    createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
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
    metadata: jsonb()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    read: boolean().default(false).notNull(),
    createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
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
    createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
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
    metadata: jsonb()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    status: bookingStatus().default('PENDING').notNull(),
    slotId: text(),
    ipHash: text().notNull(),
    createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
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
    metadata: jsonb()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    read: boolean().default(false).notNull(),
    replied: boolean().default(false).notNull(),
    createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
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
    ipHash: text(),
    metadata: jsonb()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    reactions: jsonb().default([]).notNull(),
    visible: boolean().default(true).notNull(),
    createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
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
    createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
    content: text(),
    thumbnailId: text(),
    endDate: timestamp({ precision: 3, withTimezone: true, mode: 'string' }),
    projectDate: text(),
    startDate: timestamp({ precision: 3, withTimezone: true, mode: 'string' }),
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
  publishedAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
  visible: boolean().default(true).notNull(),
  order: integer().default(0).notNull(),
  createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
});

export const aboutMe = pgTable('AboutMe', {
  id: text().primaryKey().notNull(),
  fullName: text().notNull(),
  tagline: text().notNull(),
  roles: text().array(),
  shortBio: text(),
  bio: text().notNull(),
  email: text().notNull(),
  phone: text(),
  location: text(),
  avatarUrl: text(),
  resumeUrl: text(),
  availabilityStatus: text(),
  skills: jsonb().default(sql`'[]'::jsonb`),
  experience: jsonb(),
  socialLinks: jsonb(),
  freelanceProfile: jsonb(),
  createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
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
    createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
  },
  (table) => [
    index('achievements_order_idx').using('btree', table.order.asc().nullsLast().op('int4_ops')),
    index('achievements_visible_idx').using(
      'btree',
      table.visible.asc().nullsLast().op('bool_ops')
    ),
  ]
);

export const llmSettings = pgTable('llm_settings', {
  id: text().primaryKey().notNull(),

  mainProvider: text('main_provider').notNull().default('gemini'),
  mainBaseUrl: text('main_base_url').notNull().default(''),
  mainApiKey: text('main_api_key').notNull().default(''),
  mainModel: text('main_model').notNull().default('gemini-2.5-flash'),

  fallbackProvider: text('fallback_provider'),
  fallbackBaseUrl: text('fallback_base_url'),
  fallbackApiKey: text('fallback_api_key'),
  fallbackModel: text('fallback_model'),

  embeddingProvider: text('embedding_provider').notNull().default('openai-compatible'),
  embeddingBaseUrl: text('embedding_base_url').notNull().default(''),
  embeddingApiKey: text('embedding_api_key').notNull().default(''),
  embeddingModel: text('embedding_model').notNull().default('text-embedding-3-small'),

  embeddingDimension: integer('embedding_dimension').notNull().default(1536),

  createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
});

export const appLogs = pgTable(
  'app_logs',
  {
    id: text().primaryKey().notNull(),
    timestamp: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
    receivedAt: timestamp('received_at', { precision: 3, withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    level: text().notNull(),
    service: text().notNull(),
    message: text().notNull(),
    context: jsonb(),
    errorName: text('error_name'),
    errorMessage: text('error_message'),
    errorStack: text('error_stack'),
    correlationId: text('correlation_id'),
    durationMs: integer('duration_ms'),
    route: text(),
    statusCode: integer('status_code'),
  },
  (table) => [
    index('app_logs_timestamp_idx').using(
      'btree',
      table.timestamp.asc().nullsLast().op('timestamptz_ops')
    ),
    index('app_logs_level_timestamp_idx').using(
      'btree',
      table.level.asc().nullsLast().op('text_ops'),
      table.timestamp.asc().nullsLast().op('timestamptz_ops')
    ),
    index('app_logs_service_timestamp_idx').using(
      'btree',
      table.service.asc().nullsLast().op('text_ops'),
      table.timestamp.asc().nullsLast().op('timestamptz_ops')
    ),
    index('app_logs_correlationId_idx').using(
      'btree',
      table.correlationId.asc().nullsLast().op('text_ops')
    ),
  ]
);

export const logSettings = pgTable('log_settings', {
  id: text().primaryKey().notNull(),
  minLevel: text('min_level').default('info').notNull(),
  enabled: boolean().default(true).notNull(),
  serviceOverrides: jsonb('service_overrides').default({}).notNull(),
  retentionDays: jsonb('retention_days')
    .default({ debug: 7, info: 30, warn: 90, error: 90 })
    .notNull(),
  createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
});

export const notificationChannels = pgTable('notification_channels', {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  chatId: text('chat_id').notNull(),
  messageThreadId: integer('message_thread_id'),
  enabled: boolean().default(true).notNull(),
  createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
});

export const notificationPreferences = pgTable(
  'notification_preferences',
  {
    id: text().primaryKey().notNull(),
    eventType: text('event_type').notNull(),
    channel: text().notNull(),
    enabled: boolean().default(false).notNull(),
    createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' }).notNull(),
  },
  (table) => [
    unique('notification_preferences_event_type_channel_unique').on(
      table.eventType,
      table.channel
    ),
  ]
);

export const notifications = pgTable(
  'notifications',
  {
    id: text().primaryKey().notNull(),
    eventType: text('event_type').notNull(),
    title: text().notNull(),
    body: text().notNull(),
    link: text(),
    level: text().default('info').notNull(),
    payload: jsonb(),
    readAt: timestamp('read_at', { precision: 3, withTimezone: true, mode: 'string' }),
    createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index('notifications_created_at_idx').using(
      'btree',
      table.createdAt.desc().nullsLast().op('timestamptz_ops')
    ),
    index('notifications_read_at_created_at_idx').using(
      'btree',
      table.readAt.asc().nullsLast().op('timestamptz_ops'),
      table.createdAt.desc().nullsLast().op('timestamptz_ops')
    ),
  ]
);

export const pushSubscriptions = pgTable(
  'push_subscriptions',
  {
    id: text().primaryKey().notNull(),
    endpoint: text().notNull(),
    p256dh: text().notNull(),
    auth: text().notNull(),
    label: text(),
    userAgent: text('user_agent'),
    createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    lastSeenAt: timestamp('last_seen_at', { precision: 3, withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [unique('push_subscriptions_endpoint_unique').on(table.endpoint)]
);

export const notificationOutbox = pgTable(
  'notification_outbox',
  {
    id: text().primaryKey().notNull(),
    eventType: text('event_type').notNull(),
    notificationId: text('notification_id').references(() => notifications.id, {
      onDelete: 'cascade',
    }),
    channel: text().default('telegram').notNull(),
    channelId: text('channel_id').references(() => notificationChannels.id),
    subscriptionId: text('subscription_id').references(() => pushSubscriptions.id, {
      onDelete: 'cascade',
    }),
    payload: jsonb().notNull(),
    status: text().default('pending').notNull(),
    attempts: integer().default(0).notNull(),
    nextAttemptAt: timestamp('next_attempt_at', {
      precision: 3,
      withTimezone: true,
      mode: 'string',
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    lastError: text('last_error'),
    telegramMessageId: bigint('telegram_message_id', { mode: 'number' }),
    createdAt: timestamp({ precision: 3, withTimezone: true, mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    sentAt: timestamp('sent_at', { precision: 3, withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index('notification_outbox_status_next_attempt_at_idx').using(
      'btree',
      table.status.asc().nullsLast().op('text_ops'),
      table.nextAttemptAt.asc().nullsLast().op('timestamptz_ops')
    ),
    index('notification_outbox_notification_id_idx').using(
      'btree',
      table.notificationId.asc().nullsLast().op('text_ops')
    ),
  ]
);
