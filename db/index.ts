import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzleNeon, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import * as schema from "./schema";
import { seedDatabase } from "./seed";

/**
 * The app talks to Postgres in one of two ways:
 *
 * - DATABASE_URL is set (Neon on Vercel): the real, shared database.
 * - No DATABASE_URL: demo mode with PGlite, a Postgres that runs inside the app.
 *   Locally it is stored in PGLITE_DIR (default .pglite); on Vercel it lives in memory,
 *   so every server start begins with fresh sample data and changes do not last.
 *
 * Both speak the same Drizzle API, so the rest of the app does not care which one it gets.
 * The Neon HTTP driver has no transactions, so the app does not use them.
 */
export type Database = NeonHttpDatabase<typeof schema>;

export const isDemoDatabase = !process.env.DATABASE_URL;

const globalForDb = globalThis as unknown as { databasePromise?: Promise<Database> };

export function getDb(): Promise<Database> {
  globalForDb.databasePromise ??= connect();
  return globalForDb.databasePromise;
}

async function connect(): Promise<Database> {
  if (process.env.DATABASE_URL) {
    return drizzleNeon({ client: neon(process.env.DATABASE_URL), schema });
  }

  const dataDir = process.env.VERCEL ? undefined : (process.env.PGLITE_DIR ?? ".pglite");
  return createPgliteDatabase(dataDir);
}

/**
 * A PGlite database with all migrations applied and, when empty, the sample data.
 * Also used by the tests, with an in-memory database (no dataDir).
 */
export async function createPgliteDatabase(dataDir?: string, { seed = true } = {}): Promise<Database> {
  const db = drizzlePglite({ client: new PGlite(dataDir), schema });
  await migratePglite(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });

  const database = db as unknown as Database;
  if (seed) {
    const existingUser = await database.query.users.findFirst({ columns: { id: true } });
    if (!existingUser) {
      await seedDatabase(database);
    }
  }

  return database;
}
