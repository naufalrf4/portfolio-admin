CREATE TABLE "rag"."staged_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(64) NOT NULL,
	"tool" varchar(64) NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"description" text NOT NULL,
	"consumed_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX "ix_rag_staged_actions_session_id" ON "rag"."staged_actions" USING btree ("session_id" text_ops);--> statement-breakpoint
CREATE INDEX "ix_rag_staged_actions_expires_at" ON "rag"."staged_actions" USING btree ("expires_at" timestamptz_ops);