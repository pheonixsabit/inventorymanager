import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { getDatabase } from "./connection.js";

const migrationsPath = path.resolve(process.cwd(), "migrations");

export function runMigrations() {
  const database = getDatabase();

  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const applied = new Set(
    database.prepare("SELECT name FROM schema_migrations").all().map(({ name }) => name)
  );
  const migrations = readdirSync(migrationsPath)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  for (const name of migrations) {
    if (applied.has(name)) {
      continue;
    }

    const sql = readFileSync(path.join(migrationsPath, name), "utf8");
    database.exec("BEGIN");
    try {
      database.exec(sql);
      database.prepare("INSERT INTO schema_migrations (name) VALUES (?)").run(name);
      database.exec("COMMIT");
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }
  }
}
