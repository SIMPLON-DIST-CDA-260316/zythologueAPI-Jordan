const beerSchema = {
  type: "object",
  properties: {
    id: { type: "integer", description: "Identifiant unique de la bière" },
    name: { type: "string", description: "Nom de la bière (unique)" },
    description: {
      type: "string",
      nullable: true,
      description: "Description libre",
    },
    price: { type: "number", minimum: 0, description: "Prix (≥ 0)" },
    alcoholLevel: {
      type: "number",
      minimum: 0,
      description: "Taux d'alcool en % (≥ 0)",
    },
    isAlcoholFree: {
      type: "boolean",
      description: "true si alcoholLevel < 0.5, false sinon",
    },
    breweryName: {
      type: "string",
      description: "Nom de la brasserie associée",
    },
    breweryId: {
      type: "integer",
      description: "Identifiant de la brasserie associée",
    },
  },
};

const beerExample = {
  id: 1,
  name: "Chouffe",
  description: "Bière belge ambrée épicée",
  price: 3.5,
  alcoholLevel: 8,
  isAlcoholFree: false,
  breweryName: "Brasserie d'Achouffe",
  breweryId: 2,
};

const beerLogSchema = {
  type: "object",
  properties: {
    id: { type: "integer", description: "Identifiant unique de l'entrée de log" },
    beerId: { type: "integer", description: "Identifiant de la bière concernée" },
    beerName: {
      type: "string",
      description: "Nom de la bière au moment de l'insertion",
    },
    action: {
      type: "string",
      enum: ["INSERT"],
      description: "Type d'action journalisée (uniquement les créations de bières)",
    },
    loggedAt: {
      type: "string",
      format: "date-time",
      description: "Date et heure de l'action",
    },
    loggedBy: {
      type: "string",
      description: "Rôle/utilisateur PostgreSQL à l'origine de l'action",
    },
  },
};

const beerLogExample = {
  id: 1,
  beerId: 1,
  beerName: "Chimay Rouge (Première)",
  action: "INSERT",
  loggedAt: "2024-01-10T10:00:00Z",
  loggedBy: "zythologue",
};

const errorSchema = {
  type: "object",
  properties: {
    message: { type: "string" },
    errors: { type: "object" },
  },
  required: ["message"],
};

const idParam = {
  name: "id",
  in: "path",
  required: true,
  description: "Identifiant de la bière (entier positif)",
  schema: { type: "integer", minimum: 1 },
};

const idInvalidResponse = {
  description: "Identifiant non conforme (non numérique, non entier ou ≤ 0)",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { message: "L'identifiant n'est pas conforme" },
    },
  },
};

const beerNotFoundResponse = {
  description: "Aucune bière avec cet id",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { message: "Bière non trouvée" },
    },
  },
};

const breweryNotFoundResponse = {
  description: "breweryId ne correspond à aucune brasserie",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { message: "Brasserie non trouvée" },
    },
  },
};

const nameConflictResponse = {
  description: "Une bière avec ce name existe déjà",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { message: "Une bière de ce nom existe déjà" },
    },
  },
};

export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Zythologue API",
    version: "1.0.0",
    description:
      "API REST de gestion de bières, développée dans le cadre du brief \"Zythologue\" (conception et implémentation d'une API CRUD).",
  },
  servers: [{ url: "/api/v1" }],
  components: {
    schemas: {
      Beer: beerSchema,
      BeerLog: beerLogSchema,
      Error: errorSchema,
    },
  },
  paths: {
    "/beers": {
      get: {
        summary: "Liste paginée de bières, avec filtrage et tri optionnels",
        parameters: [
          {
            name: "breweryId",
            in: "query",
            description: "Filtre les bières d'une brasserie donnée",
            schema: { type: "integer", minimum: 1 },
          },
          {
            name: "isAlcoholFree",
            in: "query",
            description: "Filtre par présence/absence d'alcool",
            schema: { type: "string", enum: ["true", "false"] },
          },
          {
            name: "sortBy",
            in: "query",
            description: "Champ de tri (défaut : tri par id)",
            schema: { type: "string", enum: ["price", "alcoholLevel"] },
          },
          {
            name: "order",
            in: "query",
            description: "Sens du tri",
            schema: { type: "string", enum: ["asc", "desc"], default: "asc" },
          },
          {
            name: "page",
            in: "query",
            description: "Numéro de page",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            description: "Nombre de résultats par page (max 100)",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 5 },
          },
        ],
        responses: {
          "200": {
            description: "Succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Beer" },
                    },
                    page: { type: "integer" },
                    limit: { type: "integer" },
                    total: { type: "integer" },
                    totalPages: { type: "integer" },
                  },
                },
                example: {
                  data: [beerExample],
                  page: 1,
                  limit: 5,
                  total: 12,
                  totalPages: 3,
                },
              },
            },
          },
          "400": {
            description: "Query param invalide ou clé inconnue",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: {
                  message: "Paramètres de requête invalides",
                  errors: {},
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Crée une nouvelle bière",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    maxLength: 255,
                    description: "Non vide (après trim), doit être unique en base",
                  },
                  description: {
                    type: "string",
                    nullable: true,
                    description: "Non vide (après trim) si fourni, null accepté",
                  },
                  price: { type: "number", minimum: 0 },
                  alcoholLevel: { type: "number", minimum: 0 },
                  isAlcoholFree: {
                    type: "boolean",
                    description:
                      "Doit correspondre à alcoholLevel : true si < 0.5, false sinon",
                  },
                  breweryId: {
                    type: "integer",
                    minimum: 1,
                    description: "Doit correspondre à une brasserie existante",
                  },
                },
                required: [
                  "name",
                  "price",
                  "alcoholLevel",
                  "isAlcoholFree",
                  "breweryId",
                ],
              },
              example: {
                name: "Chouffe",
                description: "Bière belge ambrée épicée",
                price: 3.5,
                alcoholLevel: 8,
                isAlcoholFree: false,
                breweryId: 2,
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Bière créée",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Beer" },
                example: beerExample,
              },
            },
          },
          "400": {
            description:
              "Body invalide (champ manquant, type incorrect, ou isAlcoholFree incohérent avec alcoholLevel)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Données invalides", errors: {} },
              },
            },
          },
          "404": breweryNotFoundResponse,
          "409": nameConflictResponse,
        },
      },
    },
    "/beers/{id}": {
      get: {
        summary: "Récupère une bière par son identifiant",
        parameters: [idParam],
        responses: {
          "200": {
            description: "Bière trouvée",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Beer" },
                example: beerExample,
              },
            },
          },
          "400": idInvalidResponse,
          "404": beerNotFoundResponse,
        },
      },
      patch: {
        summary:
          "Modifie partiellement une bière existante (seuls les champs envoyés sont modifiés)",
        parameters: [idParam],
        requestBody: {
          required: true,
          description: "Tous les champs sont optionnels, mais au moins un doit être fourni",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", maxLength: 255 },
                  description: { type: "string", nullable: true },
                  price: { type: "number", minimum: 0 },
                  alcoholLevel: { type: "number", minimum: 0 },
                  isAlcoholFree: { type: "boolean" },
                  breweryId: { type: "integer", minimum: 1 },
                },
              },
              example: { price: 3.9 },
            },
          },
        },
        responses: {
          "200": {
            description: "Bière mise à jour",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Beer" },
                example: beerExample,
              },
            },
          },
          "400": {
            description:
              "id non conforme, body vide/invalide, ou isAlcoholFree/alcoholLevel incohérents après fusion",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Aucun champ à modifier" },
              },
            },
          },
          "404": beerNotFoundResponse,
          "409": nameConflictResponse,
        },
      },
      delete: {
        summary: "Supprime une bière par son identifiant",
        parameters: [idParam],
        responses: {
          "204": { description: "Bière supprimée" },
          "400": idInvalidResponse,
          "404": beerNotFoundResponse,
        },
      },
    },
    "/beer-logs": {
      get: {
        summary:
          "Liste paginée du journal des insertions de bières (alimenté automatiquement par un trigger PostgreSQL, lecture seule)",
        parameters: [
          {
            name: "beerId",
            in: "query",
            description: "Filtre les entrées concernant une bière donnée",
            schema: { type: "integer", minimum: 1 },
          },
          {
            name: "order",
            in: "query",
            description: "Sens du tri par date de journalisation",
            schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
          },
          {
            name: "page",
            in: "query",
            description: "Numéro de page",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            description: "Nombre de résultats par page (max 100)",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 5 },
          },
        ],
        responses: {
          "200": {
            description: "Succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/BeerLog" },
                    },
                    page: { type: "integer" },
                    limit: { type: "integer" },
                    total: { type: "integer" },
                    totalPages: { type: "integer" },
                  },
                },
                example: {
                  data: [beerLogExample],
                  page: 1,
                  limit: 5,
                  total: 30,
                  totalPages: 6,
                },
              },
            },
          },
          "400": {
            description: "Query param invalide ou clé inconnue",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: {
                  message: "Paramètres de requête invalides",
                  errors: {},
                },
              },
            },
          },
        },
      },
    },
  },
};
