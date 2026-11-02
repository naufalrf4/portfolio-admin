import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import postgres from 'postgres';

// Compares the drizzle journal on disk against drizzle.__drizzle_migrations in
// the database. A migration that exists in git but never reached the database is
// invisible until app code hits the missing relation at runtime (Postgres
// 42P01) — which is exactly how notification_channels went missing in
// production while every build stayed green.

type JournalEntry = {
  readonly idx: number;
  readonly tag: string;
  readonly when: number;
};

type Journal = {
  readonly entries: readonly JournalEntry[];
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('db:verify failed: DATABASE_URL is not set');
  process.exit(1);
}

const journalPath = join(import.meta.dir, '..', 'drizzle', 'meta', '_journal.json');
const journal = JSON.parse(readFileSync(journalPath, 'utf8')) as Journal;
const sql = postgres(databaseUrl, { max: 1, onnotice: () => {} });

try {
  const applied = await sql<{ readonly created_at: string }[]>`
    select created_at from drizzle.__drizzle_migrations order by created_at asc
  `;

  const appliedStamps = new Set(applied.map((row) => String(row.created_at)));
  const pending = journal.entries.filter((entry) => !appliedStamps.has(String(entry.when)));

  console.log(`migrations on disk: ${journal.entries.length}`);
  console.log(`migrations applied : ${applied.length}`);

  if (pending.length > 0) {
    console.error('');
    console.error(`db:verify FAILED: ${pending.length} migration(s) never applied:`);
    for (const entry of pending) {
      console.error(`  - ${String(entry.idx).padStart(4, '0')} ${entry.tag}`);
    }
    console.error('');
    console.error('Run `bun run db:migrate` against this database before serving traffic.');
    process.exit(1);
  }

  if (applied.length > journal.entries.length) {
    console.error('');
    console.error('db:verify FAILED: the database is AHEAD of this checkout.');
    console.error('This deploy would run older code against a newer schema.');
    process.exit(1);
  }

  console.log('db:verify ok: schema matches the migration journal');
} finally {
  await sql.end();
}
