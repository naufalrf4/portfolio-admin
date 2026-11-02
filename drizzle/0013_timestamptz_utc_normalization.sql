ALTER TABLE "AboutMe" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone USING "createdAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "AboutMe" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "AboutMe" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone USING "updatedAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone USING "createdAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone USING "updatedAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "analytics_events" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone USING "createdAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "analytics_events" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "anonymous_messages" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone USING "createdAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "anonymous_messages" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "anonymous_messages" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone USING "updatedAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "BlogLink" ALTER COLUMN "publishedAt" SET DATA TYPE timestamp(3) with time zone USING "publishedAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "BlogLink" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone USING "createdAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "BlogLink" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "BlogLink" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone USING "updatedAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "booking_availability" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone USING "createdAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "booking_availability" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "booking_availability" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone USING "updatedAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "booking_settings" ALTER COLUMN "google_calendar_connected_at" SET DATA TYPE timestamp(3) with time zone USING "google_calendar_connected_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "booking_settings" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone USING "createdAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "booking_settings" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "booking_settings" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone USING "updatedAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "booking_slots" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone USING "createdAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "booking_slots" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "booking_slots" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone USING "updatedAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone USING "createdAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone USING "updatedAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "chat_logs" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone USING "createdAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "chat_logs" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "chat_logs" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone USING "updatedAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "contact_forms" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone USING "createdAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "contact_forms" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "contact_forms" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone USING "updatedAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "contact_settings" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone USING "createdAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "contact_settings" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "contact_settings" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone USING "updatedAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "guestbook_entries" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone USING "createdAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "guestbook_entries" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "guestbook_entries" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone USING "updatedAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "knowledge_docs" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone USING "createdAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "knowledge_docs" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "knowledge_docs" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone USING "updatedAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "llm_settings" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone USING "createdAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "llm_settings" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "llm_settings" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone USING "updatedAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "profile_links" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone USING "createdAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "profile_links" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "profile_links" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone USING "updatedAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "project_images" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone USING "createdAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "project_images" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone USING "createdAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone USING "updatedAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "endDate" SET DATA TYPE timestamp(3) with time zone USING "endDate" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "startDate" SET DATA TYPE timestamp(3) with time zone USING "startDate" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "expires" SET DATA TYPE timestamp(3) with time zone USING "expires" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "createdAt" SET DATA TYPE timestamp(3) with time zone USING "createdAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp(3) with time zone USING "updatedAt" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "verification_tokens" ALTER COLUMN "expires" SET DATA TYPE timestamp(3) with time zone USING "expires" AT TIME ZONE 'UTC';