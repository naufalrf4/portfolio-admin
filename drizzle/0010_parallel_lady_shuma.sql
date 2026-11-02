ALTER TABLE "rag"."chunks" ALTER COLUMN "contextual_content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "rag"."chunks" ALTER COLUMN "contextual_content" SET DEFAULT NULL;
