import { config as loadEnv } from 'dotenv';
import postgres from 'postgres';

loadEnv({ path: '.env.local' });
loadEnv();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to reset the database.');
}

const sql = postgres(databaseUrl, {
  max: 1,
  prepare: false,
});

const EXCLUDED_TABLES = new Set(['_prisma_migrations', '__drizzle_migrations']);

type TableRow = {
  schemaname: string;
  tablename: string;
};

async function main() {
  const tables = await sql<TableRow[]>`
    select schemaname, tablename
    from pg_tables
    where schemaname in ('public', 'rag')
    order by schemaname, tablename
  `;

  const targets = tables.filter((table) => !EXCLUDED_TABLES.has(table.tablename));

  if (targets.length === 0) {
    console.log('No resettable tables found in public or rag schemas.');
    return;
  }

  const truncateTargets = targets
    .map(({ schemaname, tablename }) => `"${schemaname}"."${tablename}"`)
    .join(', ');

  await sql.unsafe(`TRUNCATE TABLE ${truncateTargets} RESTART IDENTITY CASCADE`);

  console.log(
    `Reset ${targets.length} tables across schemas: ${[...new Set(targets.map((table) => table.schemaname))].join(', ')}`
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end();
  });
