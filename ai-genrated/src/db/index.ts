import { drizzle as drizzleNodePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite, type PgliteDatabase } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import path from "path";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

export type AppDatabase = NodePgDatabase<typeof schema> | PgliteDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  __appDb?: AppDatabase;
  __arenaNextJsPostgresqlPool?: Pool;
  __pgliteClient?: PGlite;
  __migrationPromise?: Promise<void>;
  __isMigrated?: boolean;
};

let db: AppDatabase;
let pool: Pool | undefined = globalForDb.__arenaNextJsPostgresqlPool;

if (databaseUrl) {
  if (!globalForDb.__arenaNextJsPostgresqlPool) {
    globalForDb.__arenaNextJsPostgresqlPool = new Pool({
      connectionString: databaseUrl,
    });
  }
  pool = globalForDb.__arenaNextJsPostgresqlPool;
  if (!globalForDb.__appDb) {
    globalForDb.__appDb = drizzleNodePg(pool, { schema });
  }
  db = globalForDb.__appDb;
} else {
  if (!globalForDb.__pgliteClient) {
    globalForDb.__pgliteClient = new PGlite();
  }
  if (!globalForDb.__appDb) {
    globalForDb.__appDb = drizzlePglite(globalForDb.__pgliteClient, { schema });
  }
  db = globalForDb.__appDb;
}

export async function ensureDbMigrations() {
  if (globalForDb.__isMigrated) return;
  if (!globalForDb.__migrationPromise) {
    globalForDb.__migrationPromise = (async () => {
      const migrationsFolder = path.join(process.cwd(), "drizzle");
      if (databaseUrl) {
        const { migrate } = await import("drizzle-orm/node-postgres/migrator");
        await migrate(db as NodePgDatabase<typeof schema>, { migrationsFolder });
      } else {
        const { migrate } = await import("drizzle-orm/pglite/migrator");
        await migrate(db as PgliteDatabase<typeof schema>, { migrationsFolder });
      }
      globalForDb.__isMigrated = true;
    })();
  }
  return globalForDb.__migrationPromise;
}

export { db, pool };
