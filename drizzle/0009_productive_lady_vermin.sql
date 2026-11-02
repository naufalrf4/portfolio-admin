ALTER TABLE "rag"."chunks" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "rag"."documents" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "rag"."ingestion_runs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();