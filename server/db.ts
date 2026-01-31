import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import fs from "fs";
import path from "path";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

/**
 * Apply SQL migrations from the migrations/ folder if core tables are missing.
 * This is a safe fallback so deploys don't fail when migrations weren't run during build.
 */
export async function applyMigrationsIfNeeded() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT to_regclass('public.users') AS exists");
    if (res.rows[0].exists) {
      return; // users table exists, migrations already applied
    }

    console.log('⚙️ Applying migrations: users table not found');

    const migrationsDir = path.resolve(process.cwd(), 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.warn('No migrations directory found, skipping migrations');
      return;
    }

    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
    for (const file of files) {
      const fullPath = path.join(migrationsDir, file);
      const raw = fs.readFileSync(fullPath, 'utf-8');

      // drizzle outputs --> statement-breakpoint separators; split statements by that
      const parts = raw.split('--> statement-breakpoint');
      for (let stmt of parts) {
        stmt = stmt.trim();
        if (!stmt) continue;

        // make CREATE TABLE idempotent
        stmt = stmt.replace(/CREATE TABLE "(\w+)"/g, 'CREATE TABLE IF NOT EXISTS "$1"');

        try {
          await client.query(stmt);
        } catch (err: any) {
          console.error(`Migration statement failed: ${err.message || err}`);
        }
      }
    }

    console.log('✅ Migrations applied (fallback)');
  } finally {
    client.release();
  }
}
