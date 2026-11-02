ALTER TABLE "llm_settings" ALTER COLUMN "embedding_provider" SET DEFAULT 'openai-compatible';--> statement-breakpoint
ALTER TABLE "llm_settings" ALTER COLUMN "embedding_model" SET DEFAULT 'text-embedding-3-small';--> statement-breakpoint
ALTER TABLE "llm_settings" ALTER COLUMN "embedding_dimension" SET DEFAULT 1536;--> statement-breakpoint
-- Embedding model switch (768-dim gemini-embedding-001 -> 1536-dim text-embedding-3-small).
-- Old vectors are incompatible across dimensions, so chunks must be cleared and re-ingested.
-- After migrating: reset+reseed (bun run reset:seed) or trigger Admin -> RAG re-ingest.
TRUNCATE TABLE "rag"."chunks";--> statement-breakpoint
ALTER TABLE "rag"."chunks" ALTER COLUMN "contextual_content" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rag"."chunks" ALTER COLUMN "embedding" SET DATA TYPE vector(1536);