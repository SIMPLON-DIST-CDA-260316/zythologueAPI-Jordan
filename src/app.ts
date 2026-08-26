import express, { type Express } from "express";
import swaggerUi from "swagger-ui-express";
import { openapiSpec } from "./docs/openapiSpec.ts";
import beerLogRoutes from "./routes/beerLogRoutes.ts";
import beerRoutes from "./routes/beerRoutes.ts";

const app: Express = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.use("/api/V1/beers", beerRoutes);
app.use("/api/beer-logs", beerLogRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
