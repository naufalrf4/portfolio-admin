CREATE TYPE "public"."BookingStatus" AS ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."ProjectContextType" AS ENUM('CONTEXT', 'ROLE', 'DECISIONS', 'TRADEOFFS', 'RESULT', 'ARCHITECTURE', 'OPERATIONS', 'METRICS');--> statement-breakpoint
CREATE TYPE "public"."SlotStatus" AS ENUM('AVAILABLE', 'BOOKED', 'BLOCKED');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('ADMIN', 'USER');--> statement-breakpoint
CREATE TABLE "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionId" text NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_links" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"icon" text,
	"visible" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_docs" (
	"id" text PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"content" text NOT NULL,
	"indexed" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	CONSTRAINT "knowledge_docs_filename_unique" UNIQUE("filename")
);
--> statement-breakpoint
CREATE TABLE "project_contexts" (
	"id" text PRIMARY KEY NOT NULL,
	"projectId" text NOT NULL,
	"type" "ProjectContextType" NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"image" text,
	"role" "UserRole" DEFAULT 'USER' NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp(3) NOT NULL,
	CONSTRAINT "verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "contact_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"notificationEmail" text,
	"blockedKeywords" text[],
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"notificationEmail" text,
	"reminderEnabled" boolean DEFAULT true NOT NULL,
	"reminderDay" integer DEFAULT 6 NOT NULL,
	"reminderTime" text DEFAULT '09:00' NOT NULL,
	"timezone" text DEFAULT 'Asia/Jakarta' NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_availability" (
	"id" text PRIMARY KEY NOT NULL,
	"dayOfWeek" integer NOT NULL,
	"startTime" text NOT NULL,
	"endTime" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionToken" text NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_images" (
	"id" text PRIMARY KEY NOT NULL,
	"projectId" text NOT NULL,
	"url" text NOT NULL,
	"key" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"caption" text,
	"alt" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_slots" (
	"id" text PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"time" text NOT NULL,
	"duration" integer DEFAULT 60 NOT NULL,
	"status" "SlotStatus" DEFAULT 'AVAILABLE' NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "anonymous_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"ipHash" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"city" text,
	"country" text,
	"countryCode" text,
	"ipAddress" text,
	"region" text
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" text PRIMARY KEY NOT NULL,
	"page" varchar(100) NOT NULL,
	"entityType" varchar(50) NOT NULL,
	"entityId" text,
	"eventType" varchar(20) NOT NULL,
	"data" jsonb,
	"userSession" text,
	"ipAddress" varchar(45),
	"countryCode" varchar(2),
	"city" varchar(100),
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"notes" text,
	"status" "BookingStatus" DEFAULT 'PENDING' NOT NULL,
	"slotId" text,
	"ipHash" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"city" text,
	"country" text,
	"countryCode" text,
	"ipAddress" text,
	"region" text
);
--> statement-breakpoint
CREATE TABLE "contact_forms" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text,
	"message" text NOT NULL,
	"ipHash" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"replied" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"city" text,
	"country" text,
	"countryCode" text,
	"ipAddress" text,
	"region" text
);
--> statement-breakpoint
CREATE TABLE "guestbook_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"message" text NOT NULL,
	"reactions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"city" text,
	"country" text,
	"countryCode" text,
	"ipAddress" text,
	"region" text
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"summary" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"techStack" text[],
	"liveUrl" text,
	"repoUrl" text,
	"imageUrl" text,
	"featured" boolean DEFAULT false NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"content" text,
	"thumbnailId" text,
	"endDate" timestamp(3),
	"projectDate" text,
	"startDate" timestamp(3),
	"tags" text[],
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "BlogLink" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"imageUrl" text,
	"source" text NOT NULL,
	"category" text,
	"tags" text[],
	"publishedAt" timestamp(3) NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "AboutMe" (
	"id" text PRIMARY KEY NOT NULL,
	"fullName" text NOT NULL,
	"tagline" text NOT NULL,
	"roles" text[],
	"bio" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"location" text,
	"avatarUrl" text,
	"resumeUrl" text,
	"availabilityStatus" text,
	"skills" text[],
	"experience" jsonb,
	"socialLinks" jsonb,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" text NOT NULL,
	"monthYear" text NOT NULL,
	"photos" text[],
	"description" text NOT NULL,
	"externalUrl" text,
	"order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_contexts" ADD CONSTRAINT "project_contexts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "public"."booking_slots"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "guestbook_entries" ADD CONSTRAINT "guestbook_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "chat_logs_createdAt_idx" ON "chat_logs" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "chat_logs_sessionId_idx" ON "chat_logs" USING btree ("sessionId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "chat_logs_sessionId_key" ON "chat_logs" USING btree ("sessionId" text_ops);--> statement-breakpoint
CREATE INDEX "profile_links_order_idx" ON "profile_links" USING btree ("order" int4_ops);--> statement-breakpoint
CREATE INDEX "profile_links_visible_idx" ON "profile_links" USING btree ("visible" bool_ops);--> statement-breakpoint
CREATE INDEX "knowledge_docs_filename_idx" ON "knowledge_docs" USING btree ("filename" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "knowledge_docs_filename_key" ON "knowledge_docs" USING btree ("filename" text_ops);--> statement-breakpoint
CREATE INDEX "knowledge_docs_indexed_idx" ON "knowledge_docs" USING btree ("indexed" bool_ops);--> statement-breakpoint
CREATE INDEX "project_contexts_order_idx" ON "project_contexts" USING btree ("order" int4_ops);--> statement-breakpoint
CREATE INDEX "project_contexts_projectId_idx" ON "project_contexts" USING btree ("projectId" text_ops);--> statement-breakpoint
CREATE INDEX "project_contexts_type_idx" ON "project_contexts" USING btree ("type" enum_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens" USING btree ("identifier" text_ops,"token" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens" USING btree ("token" text_ops);--> statement-breakpoint
CREATE INDEX "booking_availability_dayOfWeek_idx" ON "booking_availability" USING btree ("dayOfWeek" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "booking_availability_dayOfWeek_startTime_endTime_key" ON "booking_availability" USING btree ("dayOfWeek" int4_ops,"startTime" text_ops,"endTime" text_ops);--> statement-breakpoint
CREATE INDEX "booking_availability_enabled_idx" ON "booking_availability" USING btree ("enabled" bool_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts" USING btree ("provider" text_ops,"providerAccountId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions" USING btree ("sessionToken" text_ops);--> statement-breakpoint
CREATE INDEX "project_images_order_idx" ON "project_images" USING btree ("order" int4_ops);--> statement-breakpoint
CREATE INDEX "project_images_projectId_idx" ON "project_images" USING btree ("projectId" text_ops);--> statement-breakpoint
CREATE INDEX "booking_slots_date_status_idx" ON "booking_slots" USING btree ("date" date_ops,"status" enum_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "booking_slots_date_time_key" ON "booking_slots" USING btree ("date" date_ops,"time" text_ops);--> statement-breakpoint
CREATE INDEX "anonymous_messages_city_idx" ON "anonymous_messages" USING btree ("city" text_ops);--> statement-breakpoint
CREATE INDEX "anonymous_messages_countryCode_idx" ON "anonymous_messages" USING btree ("countryCode" text_ops);--> statement-breakpoint
CREATE INDEX "anonymous_messages_createdAt_idx" ON "anonymous_messages" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "anonymous_messages_read_idx" ON "anonymous_messages" USING btree ("read" bool_ops);--> statement-breakpoint
CREATE INDEX "analytics_events_createdAt_idx" ON "analytics_events" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "analytics_events_entityType_entityId_idx" ON "analytics_events" USING btree ("entityType" text_ops,"entityId" text_ops);--> statement-breakpoint
CREATE INDEX "analytics_events_eventType_idx" ON "analytics_events" USING btree ("eventType" text_ops);--> statement-breakpoint
CREATE INDEX "analytics_events_page_idx" ON "analytics_events" USING btree ("page" text_ops);--> statement-breakpoint
CREATE INDEX "bookings_countryCode_idx" ON "bookings" USING btree ("countryCode" text_ops);--> statement-breakpoint
CREATE INDEX "bookings_createdAt_idx" ON "bookings" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_slotId_key" ON "bookings" USING btree ("slotId" text_ops);--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "contact_forms_countryCode_idx" ON "contact_forms" USING btree ("countryCode" text_ops);--> statement-breakpoint
CREATE INDEX "contact_forms_createdAt_idx" ON "contact_forms" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "contact_forms_read_idx" ON "contact_forms" USING btree ("read" bool_ops);--> statement-breakpoint
CREATE INDEX "guestbook_entries_countryCode_idx" ON "guestbook_entries" USING btree ("countryCode" text_ops);--> statement-breakpoint
CREATE INDEX "guestbook_entries_createdAt_idx" ON "guestbook_entries" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "guestbook_entries_userId_idx" ON "guestbook_entries" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "guestbook_entries_visible_idx" ON "guestbook_entries" USING btree ("visible" bool_ops);--> statement-breakpoint
CREATE INDEX "projects_category_idx" ON "projects" USING btree ("category" text_ops);--> statement-breakpoint
CREATE INDEX "projects_featured_idx" ON "projects" USING btree ("featured" bool_ops);--> statement-breakpoint
CREATE INDEX "projects_order_idx" ON "projects" USING btree ("order" int4_ops);--> statement-breakpoint
CREATE INDEX "projects_slug_idx" ON "projects" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "projects_slug_key" ON "projects" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE INDEX "projects_visible_idx" ON "projects" USING btree ("visible" bool_ops);--> statement-breakpoint
CREATE INDEX "achievements_order_idx" ON "achievements" USING btree ("order" int4_ops);--> statement-breakpoint
CREATE INDEX "achievements_visible_idx" ON "achievements" USING btree ("visible" bool_ops);--> statement-breakpoint
