import express, { type Express } from "express";
import swaggerUi from "swagger-ui-express";
import { openapiSpec } from "./docs/openapiSpec.ts";
import beerRoutes from "./routes/beerRoutes.ts";

const app: Express = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.use("/api/beers", beerRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
