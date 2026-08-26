import express, { type Express } from "express";
import swaggerUi from "swagger-ui-express";
import { openapiSpec } from "./docs/openapiSpec.ts";
import v1Router from "./routes/v1/index.ts";

const app: Express = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.use("/api/v1", v1Router);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
