import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../db.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const schema = await readFile(
    path.join(__dirname, "migrateSchema.sql"),
    "utf-8",
  );

  console.log("Running migration...");
  await pool.query(schema);
  console.log("Migration complete.");

  await pool.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
