import express, { type Express, type Request, type Response } from "express";
import { pool } from "./db.ts";

const app: Express = express();
const port = process.env.PORT ?? 3000;

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World!");
});

app.get("/health/db", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: "error", message: (err as Error).message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
