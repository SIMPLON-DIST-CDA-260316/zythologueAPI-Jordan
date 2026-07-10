import express, { type Express } from "express";
import beerRoutes from "./routes/beerRoutes.ts";

const app: Express = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

app.use("/api/beers", beerRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
