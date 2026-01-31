import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import fs from "fs";
import path from "path";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Make pool and db optional so the app can start even if the DATABASE_URL
// is not configured yet. This allows a clearer log message and a fallback
// migration attempt instead of an immediate crash during startup.
export let pool: pg.Pool | null = null;
export let db: ReturnType<typeof drizzle> | null = null;

if (!process.env.DATABASE_URL) {
  console.warn(
    "⚠️ DATABASE_URL is not set. The app will start but database operations will fail until you set DATABASE_URL in Render Environment variables.",
  );
} else {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
}

/**
 * Apply SQL migrations from the migrations/ folder if core tables are missing.
 * This is a safe fallback so deploys don't fail when migrations weren't run during build.
 */
import { execSync } from "child_process";

export async function applyMigrationsIfNeeded() {
  if (!pool) {
    console.warn('⚠️ Skipping migrations: DATABASE_URL not configured or pool not available.');
    return;
  }

  // First try using drizzle-kit (more robust) if available
  try {
    console.log('⚙️ Attempting to run `drizzle-kit push`... (cwd=' + process.cwd() + ')');
    const cmd = `npx drizzle-kit push --schema ./shared/schema.ts --url "${process.env.DATABASE_URL}"`;
    const child = execSync(cmd, { stdio: 'pipe', env: process.env });
    const out = child.toString();
    console.log('✅ drizzle-kit output:\n', out);
    return;
  } catch (err: any) {
    console.warn('⚠️ drizzle-kit push failed or not available, falling back to SQL apply. Error:', (err && (err.message || err)).toString());
    if (err && err.stdout) console.warn('drizzle-kit stdout:', err.stdout.toString());
    if (err && err.stderr) console.warn('drizzle-kit stderr:', err.stderr.toString());
  }

  // Try opening a connection to determine if DB is reachable
  let client;
  try {
    client = await pool.connect();
  } catch (err: any) {
    console.error('❌ Could not connect to the database:', err.message || err);
    throw err;
  }
  try {
    const res = await client.query("SELECT to_regclass('public.users') AS exists");
    if (res.rows[0].exists) {
      return; // users table exists, migrations already applied
    }

    console.log('⚙️ Applying migrations: users table not found (SQL fallback)');

    // If running from compiled `dist` the CWD may not be project root.
    // Search upward for a `migrations` directory to support Render runtime.
    function findMigrationsDir(): string | null {
      let dir = process.cwd();
      for (let i = 0; i < 6; i++) {
        const candidate = path.join(dir, 'migrations');
        if (fs.existsSync(candidate)) return candidate;
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
      }
      return null;
    }

    const migrationsDir = findMigrationsDir();
    if (!migrationsDir) {
      console.warn('No migrations directory found (searched up from CWD), skipping migrations');
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
