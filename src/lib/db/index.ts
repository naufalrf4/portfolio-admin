import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as relations from './relations';

const client = postgres(process.env.DATABASE_URL!, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  connection: {
    timezone: 'Asia/Jakarta',
  },
});

export const db = drizzle(client, {
  schema: {
    ...schema,
    ...relations,
  },
});
