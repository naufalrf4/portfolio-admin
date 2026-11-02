CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "rag";
--> statement-breakpoint
DROP TABLE IF EXISTS "public"."rag_sources" CASCADE;
--> statement-breakpoint
DROP TYPE IF EXISTS "public"."RagSourceSensitivity";
--> statement-breakpoint
DROP TYPE IF EXISTS "public"."RagSourceStatus";
--> statement-breakpoint
DROP TYPE IF EXISTS "public"."RagSourceType";
--> statement-breakpoint
DROP TYPE IF EXISTS "public"."RagSourceVisibility";
--> statement-breakpoint
CREATE TABLE "rag"."chunks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"document_id" uuid NOT NULL,
	"chunk_index" integer NOT NULL,
	"source_type" varchar(32) NOT NULL,
	"source_ref" varchar(255) NOT NULL,
	"visibility" varchar(32) DEFAULT 'private' NOT NULL,
	"content" text NOT NULL,
	"contextual_content" text NOT NULL,
	"token_count" integer NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"embedding" vector(768) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "uq_rag_chunks_document_index" UNIQUE("document_id","chunk_index")
);
--> statement-breakpoint
CREATE TABLE "rag"."documents" (
	"id" uuid PRIMARY KEY NOT NULL,
	"source_type" varchar(32) NOT NULL,
	"source_ref" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"visibility" varchar(32) DEFAULT 'private' NOT NULL,
	"sensitivity" varchar(32) DEFAULT 'normal' NOT NULL,
	"storage_key" varchar(512),
	"mime_type" varchar(128),
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"content_hash" varchar(64),
	"content_excerpt" text,
	"last_ingested_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "uq_rag_documents_source" UNIQUE("source_type","source_ref")
);
--> statement-breakpoint
CREATE TABLE "rag"."ingestion_runs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"document_id" uuid,
	"trigger_type" varchar(32) NOT NULL,
	"request_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"chunks_written" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"started_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rag"."chunks" ADD CONSTRAINT "rag_chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "rag"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rag"."ingestion_runs" ADD CONSTRAINT "rag_ingestion_runs_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "rag"."documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ix_rag_chunks_document_id" ON "rag"."chunks" USING btree ("document_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "ix_rag_chunks_source_ref" ON "rag"."chunks" USING btree ("source_ref" text_ops);--> statement-breakpoint
CREATE INDEX "ix_rag_chunks_visibility" ON "rag"."chunks" USING btree ("visibility" text_ops);--> statement-breakpoint
CREATE INDEX "ix_rag_documents_source_ref" ON "rag"."documents" USING btree ("source_ref" text_ops);--> statement-breakpoint
CREATE INDEX "ix_rag_documents_visibility" ON "rag"."documents" USING btree ("visibility" text_ops);--> statement-breakpoint
CREATE INDEX "ix_rag_documents_status" ON "rag"."documents" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "ix_rag_ingestion_runs_document_id" ON "rag"."ingestion_runs" USING btree ("document_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "ix_rag_ingestion_runs_status" ON "rag"."ingestion_runs" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "ix_rag_chunks_metadata_gin" ON "rag"."chunks" USING gin ("metadata");--> statement-breakpoint
CREATE INDEX "ix_rag_chunks_embedding_hnsw" ON "rag"."chunks" USING hnsw ("embedding" vector_cosine_ops);
