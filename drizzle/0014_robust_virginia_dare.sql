CREATE TABLE "app_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"timestamp" timestamp(3) with time zone NOT NULL,
	"received_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"level" text NOT NULL,
	"service" text NOT NULL,
	"message" text NOT NULL,
	"context" jsonb,
	"error_name" text,
	"error_message" text,
	"error_stack" text,
	"correlation_id" text,
	"duration_ms" integer,
	"route" text,
	"status_code" integer
);
--> statement-breakpoint
CREATE TABLE "log_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"min_level" text DEFAULT 'info' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"service_overrides" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"retention_days" jsonb DEFAULT '{"debug":7,"info":30,"warn":90,"error":90}'::jsonb NOT NULL,
	"createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "app_logs_timestamp_idx" ON "app_logs" USING btree ("timestamp" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "app_logs_level_timestamp_idx" ON "app_logs" USING btree ("level" text_ops,"timestamp" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "app_logs_service_timestamp_idx" ON "app_logs" USING btree ("service" text_ops,"timestamp" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "app_logs_correlationId_idx" ON "app_logs" USING btree ("correlation_id" text_ops);