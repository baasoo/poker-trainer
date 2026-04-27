import { Pool } from "@neondatabase/serverless";

let db: Pool | null = null;

export function getDb(): Pool {
  if (!db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    db = new Pool({
      connectionString,
      idleTimeoutMillis: 120000,
      connectionTimeoutMillis: 10000,
      max: 5,
    });
  }
  return db;
}
