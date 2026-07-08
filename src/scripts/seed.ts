import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../db.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seed() {
  const schema = await readFile(path.join(__dirname, "seedSchema.sql"), "utf-8");

  console.log("Running seed...");
  await pool.query(schema);
  console.log("Seed complete.");

  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
