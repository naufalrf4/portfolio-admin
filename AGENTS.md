# portfolio-admin

Standalone service repository. Keep its build self-contained and preserve the runtime/API boundary documented in README.md. Secrets belong in deployment environment, never in Git.

- The TypeSafe JEv API key is the exception to runtime-only provider secrets: Admin stores it encrypted in `llm_settings`, exposes only a configured/unset state to the browser, and decrypts it only for the service-authenticated internal config response to RAG. Keep `NEXTAUTH_SECRET` stable across deployments because it derives the encryption key.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
