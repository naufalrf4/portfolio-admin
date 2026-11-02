CREATE TABLE "llm_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"main_provider" text DEFAULT 'gemini' NOT NULL,
	"main_base_url" text DEFAULT '' NOT NULL,
	"main_api_key" text DEFAULT '' NOT NULL,
	"main_model" text DEFAULT 'gemini-2.5-flash' NOT NULL,
	"fallback_provider" text,
	"fallback_base_url" text,
	"fallback_api_key" text,
	"fallback_model" text,
	"embedding_provider" text DEFAULT 'gemini' NOT NULL,
	"embedding_base_url" text DEFAULT '' NOT NULL,
	"embedding_api_key" text DEFAULT '' NOT NULL,
	"embedding_model" text DEFAULT 'gemini-embedding-001' NOT NULL,
	"embedding_dimension" integer DEFAULT 768 NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "AboutMe" ALTER COLUMN "skills" SET DATA TYPE jsonb USING to_jsonb("skills");--> statement-breakpoint
ALTER TABLE "AboutMe" ALTER COLUMN "skills" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "booking_settings" ADD COLUMN "google_calendar_refresh_token" text;--> statement-breakpoint
ALTER TABLE "booking_settings" ADD COLUMN "google_calendar_calendar_id" text;--> statement-breakpoint
ALTER TABLE "booking_settings" ADD COLUMN "google_calendar_calendar_name" text;--> statement-breakpoint
ALTER TABLE "booking_settings" ADD COLUMN "google_calendar_connected_email" text;--> statement-breakpoint
ALTER TABLE "booking_settings" ADD COLUMN "google_calendar_granted_scopes" text[];--> statement-breakpoint
ALTER TABLE "booking_settings" ADD COLUMN "google_calendar_connected_at" timestamp(3);