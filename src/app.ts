import express, { type Express } from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { UPLOADS_PUBLIC_PATH, UPLOADS_ROOT } from "./config/upload.ts";
import { openapiSpec } from "./docs/openapiSpec.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";
import { notFoundHandler } from "./middlewares/notFoundHandler.ts";
import v1Router from "./routes/v1/index.ts";
import { ensureUploadDirectories } from "./services/imageService.ts";

const app: Express = express();
const port = process.env.PORT ?? 3000;

app.use(helmet());

app.use(express.json());

// Les uploads sont créés au démarrage pour que express.static ait une racine
// existante, même sur un volume fraîchement monté.
await ensureUploadDirectories();

// Servir des fichiers déposés par des tiers depuis la même origine est un
// vecteur XSS classique. Ici seuls des .webp produits par Sharp sont écrits,
// mais nosniff + CSP restrictive ne coûtent rien en défense en profondeur.
app.use(
  UPLOADS_PUBLIC_PATH,
  express.static(UPLOADS_ROOT, {
    index: false,
    dotfiles: "deny",
    maxAge: "7d",
    immutable: true, // sûr : les noms sont des UUID, un fichier n'est jamais réécrit
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
    },
  }),
);

// Swagger UI a besoin de scripts/styles inline : la CSP par défaut de Helmet
// la casserait. On la remplace par une CSP dédiée, uniquement sur cette route.
app.use(
  "/api-docs",
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:"],
      },
    },
  }),
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec),
);

app.use("/api/v1", v1Router);

app.use(notFoundHandler); // routes non matchées
app.use(errorHandler); // toujours en tout dernier

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
