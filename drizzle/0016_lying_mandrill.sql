CREATE TABLE "notification_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"channel" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) with time zone NOT NULL,
	CONSTRAINT "notification_preferences_event_type_channel_unique" UNIQUE("event_type","channel")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"link" text,
	"level" text DEFAULT 'info' NOT NULL,
	"payload" jsonb,
	"read_at" timestamp(3) with time zone,
	"createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"label" text,
	"user_agent" text,
	"createdAt" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"last_seen_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
ALTER TABLE "notification_rules" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "notification_rules" CASCADE;--> statement-breakpoint
ALTER TABLE "notification_outbox" ALTER COLUMN "channel_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_outbox" ADD COLUMN "notification_id" text;--> statement-breakpoint
ALTER TABLE "notification_outbox" ADD COLUMN "channel" text DEFAULT 'telegram' NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_outbox" ADD COLUMN "subscription_id" text;--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("createdAt" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "notifications_read_at_created_at_idx" ON "notifications" USING btree ("read_at" timestamptz_ops,"createdAt" timestamptz_ops);--> statement-breakpoint
ALTER TABLE "notification_outbox" ADD CONSTRAINT "notification_outbox_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_outbox" ADD CONSTRAINT "notification_outbox_subscription_id_push_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."push_subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_outbox_notification_id_idx" ON "notification_outbox" USING btree ("notification_id" text_ops);