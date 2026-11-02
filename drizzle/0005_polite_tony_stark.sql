WITH context_markdown AS (
  SELECT
    "projectId",
    string_agg(
      concat('## ', trim(title), E'\n\n', trim(content)),
      E'\n\n'
      ORDER BY "order", "createdAt"
    ) AS migrated_content
  FROM "project_contexts"
  GROUP BY "projectId"
)
UPDATE "projects" AS p
SET
  "content" = CASE
    WHEN context_markdown.migrated_content IS NULL
      OR btrim(context_markdown.migrated_content) = '' THEN p."content"
    WHEN p."content" IS NULL
      OR btrim(p."content") = '' THEN context_markdown.migrated_content
    WHEN position(context_markdown.migrated_content in p."content") > 0 THEN p."content"
    ELSE concat(p."content", E'\n\n---\n\n', context_markdown.migrated_content)
  END,
  "updatedAt" = CURRENT_TIMESTAMP
FROM context_markdown
WHERE p."id" = context_markdown."projectId";--> statement-breakpoint
DROP TABLE "project_contexts" CASCADE;--> statement-breakpoint
DROP TYPE "public"."ProjectContextType";
