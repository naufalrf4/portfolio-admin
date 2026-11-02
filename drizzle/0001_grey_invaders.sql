CREATE TYPE "public"."RagSourceSensitivity" AS ENUM('NORMAL', 'PERSONAL', 'SENSITIVE');--> statement-breakpoint
CREATE TYPE "public"."RagSourceStatus" AS ENUM('PENDING', 'PROCESSING', 'INDEXED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."RagSourceType" AS ENUM('MANUAL', 'UPLOAD');--> statement-breakpoint
CREATE TYPE "public"."RagSourceVisibility" AS ENUM('PUBLIC', 'PRIVATE', 'RESTRICTED');--> statement-breakpoint
CREATE TABLE "rag_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"sourceType" "RagSourceType" NOT NULL,
	"visibility" "RagSourceVisibility" DEFAULT 'PRIVATE' NOT NULL,
	"sensitivity" "RagSourceSensitivity" DEFAULT 'NORMAL' NOT NULL,
	"status" "RagSourceStatus" DEFAULT 'PENDING' NOT NULL,
	"filename" text,
	"mimeType" text,
	"storageKey" text,
	"storageUrl" text,
	"content" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"file_size" integer,
	"last_ingested_at" timestamp(3),
	"last_ingest_error" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE INDEX "rag_sources_visibility_idx" ON "rag_sources" USING btree ("visibility" enum_ops);--> statement-breakpoint
CREATE INDEX "rag_sources_status_idx" ON "rag_sources" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "rag_sources_sourceType_idx" ON "rag_sources" USING btree ("sourceType" enum_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "rag_sources_storageKey_key" ON "rag_sources" USING btree ("storageKey" text_ops);