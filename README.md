# Admin

Standalone Next.js content/API authority and owner of database migrations. Build with `bun install --frozen-lockfile && bun run build`; migrate with `bun run db:migrate`. Runtime dependencies: PostgreSQL and private RAG API (`RAG_SERVICE_URL`).

GitHub Actions publishes immutable GHCR images from `main`. Configure the repository variables `ADMIN_R2_ACCOUNT_ID` and `ADMIN_R2_BUCKET_NAME` before publishing: Next Image validates the private R2 hostname during the build. `ADMIN_NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`, `ADMIN_NEXT_PUBLIC_GA_MEASUREMENT_ID`, and `ADMIN_NEXT_PUBLIC_VAPID_PUBLIC_KEY` are optional public build inputs for those client features.
