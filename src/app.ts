import express, { type Express, type Request, type Response } from "express";
import { pool } from "./db.ts";
import beerRoutes from "./routes/beerRoutes.ts";

const app: Express = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

app.get("/api", (_req: Request, res: Response) => {
  res.send("Hello Zythologue!");
});

app.get("/api/health/db", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: "error", message: (err as Error).message });
  }
});

app.use("/api/beers", beerRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
