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
    categories: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
        },
      },
      description:
        "Catégories associées à la bière. Présent uniquement sur GET /beers/{id}, POST /beers et PATCH /beers/{id} (absent sur la liste GET /beers).",
    },
    ingredients: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
        },
      },
      description:
        "Ingrédients associés à la bière. Présent uniquement sur GET /beers/{id}, POST /beers et PATCH /beers/{id} (absent sur la liste GET /beers).",
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

// Utilisé pour GET /beers/{id}, POST /beers et PATCH /beers/{id} : ces
// réponses relisent la bière via findOneById, qui embarque categories/ingredients.
const beerDetailExample = {
  ...beerExample,
  categories: [{ id: 1, name: "Ambrée" }],
  ingredients: [{ id: 1, name: "Houblon Saaz" }],
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

const beerPhotoSchema = {
  type: "object",
  properties: {
    id: { type: "integer", description: "Identifiant unique de la photo" },
    url: {
      type: "string",
      description:
        "Chemin de l'image principale (WebP, 1200 px max). Peut aussi être une URL externe pour les photos importées.",
    },
    thumbnailUrl: {
      type: "string",
      description:
        "Chemin de la vignette (WebP, 320 x 320). Vaut url si aucune vignette n'a été générée.",
    },
    width: {
      type: "integer",
      nullable: true,
      description: "Largeur de l'image finale en px (null si non générée par l'API)",
    },
    height: {
      type: "integer",
      nullable: true,
      description: "Hauteur de l'image finale en px (null si non générée par l'API)",
    },
    createdAt: { type: "string", format: "date-time" },
    beerId: { type: "integer", description: "Bière à laquelle la photo est rattachée" },
  },
};

const beerPhotoExample = {
  id: 21,
  url: "/uploads/beers/3f2a9c1e-8b4d-4e6f-9a2b-7c5d1e0f8a3b.webp",
  thumbnailUrl:
    "/uploads/beers/thumbs/3f2a9c1e-8b4d-4e6f-9a2b-7c5d1e0f8a3b.webp",
  width: 1200,
  height: 800,
  createdAt: "2026-08-27T12:34:56.000Z",
  beerId: 1,
};

const brewerySchema = {
  type: "object",
  properties: {
    id: { type: "integer", description: "Identifiant unique de la brasserie" },
    name: { type: "string", description: "Nom de la brasserie (unique)" },
    description: { type: "string", description: "Description libre (obligatoire)" },
    country: { type: "string", description: "Pays de la brasserie" },
    city: { type: "string", description: "Ville de la brasserie" },
    website: {
      type: "string",
      format: "uri",
      nullable: true,
      description: "Site web de la brasserie",
    },
    beerCount: {
      type: "integer",
      description: "Nombre de bières rattachées à cette brasserie",
    },
  },
};

const breweryExample = {
  id: 2,
  name: "Brasserie d'Achouffe",
  description: "Brasserie ardennaise fondée en 1982",
  country: "Belgique",
  city: "Achouffe",
  website: "https://www.achouffe.be",
  beerCount: 4,
};

const categorySchema = {
  type: "object",
  properties: {
    id: { type: "integer", description: "Identifiant unique de la catégorie" },
    name: { type: "string", description: "Nom de la catégorie (unique)" },
    description: { type: "string", description: "Description libre (obligatoire)" },
  },
};

const categoryExample = {
  id: 1,
  name: "IPA",
  description: "Bières houblonnées, amères et souvent fruitées",
};

const ingredientSchema = {
  type: "object",
  properties: {
    id: { type: "integer", description: "Identifiant unique de l'ingrédient" },
    name: { type: "string", description: "Nom de l'ingrédient (unique)" },
    description: {
      type: "string",
      nullable: true,
      description: "Description libre",
    },
  },
};

const ingredientExample = {
  id: 1,
  name: "Houblon Saaz",
  description: "Houblon noble tchèque, notes florales et épicées",
};

const breweryPhotoSchema = {
  type: "object",
  properties: {
    id: { type: "integer", description: "Identifiant unique de la photo" },
    url: {
      type: "string",
      description:
        "Chemin de l'image principale (WebP, 1200 px max). Peut aussi être une URL externe pour les photos importées.",
    },
    thumbnailUrl: {
      type: "string",
      description:
        "Chemin de la vignette (WebP, 320 x 320). Vaut url si aucune vignette n'a été générée.",
    },
    width: {
      type: "integer",
      nullable: true,
      description: "Largeur de l'image finale en px (null si non générée par l'API)",
    },
    height: {
      type: "integer",
      nullable: true,
      description: "Hauteur de l'image finale en px (null si non générée par l'API)",
    },
    createdAt: { type: "string", format: "date-time" },
    breweryId: {
      type: "integer",
      description: "Brasserie à laquelle la photo est rattachée",
    },
  },
};

const breweryPhotoExample = {
  id: 13,
  url: "/uploads/breweries/5c1d7e93-2a48-4b16-8f0c-6d9a3b7e2f41.webp",
  thumbnailUrl:
    "/uploads/breweries/thumbs/5c1d7e93-2a48-4b16-8f0c-6d9a3b7e2f41.webp",
  width: 1200,
  height: 800,
  createdAt: "2026-08-27T12:34:56.000Z",
  breweryId: 1,
};

const userSchema = {
  type: "object",
  properties: {
    id: { type: "integer", description: "Identifiant unique de l'utilisateur" },
    lastName: { type: "string" },
    firstName: { type: "string" },
    email: { type: "string", format: "email" },
    birthDate: { type: "string", format: "date" },
    role: {
      type: "string",
      enum: ["client", "admin"],
      description: "Toujours client à l'inscription",
    },
    createdAt: { type: "string", format: "date-time" },
  },
};

const userExample = {
  id: 21,
  lastName: "Durand",
  firstName: "Jean",
  email: "jean.durand@example.com",
  birthDate: "1995-06-15",
  role: "client",
  createdAt: "2026-09-30T12:34:56.000Z",
};

const breweryIdParam = {
  name: "id",
  in: "path",
  required: true,
  description: "Identifiant de la brasserie (entier positif)",
  schema: { type: "integer", minimum: 1 },
};

const errorSchema = {
  type: "object",
  properties: {
    message: { type: "string" },
    errors: { type: "object" },
  },
  required: ["message"],
};

// Le JWT voyage dans le cookie httpOnly posé par POST /auth/login. Swagger UI
// est servi sur la même origine que l'API : après un login via « Try it out »,
// le navigateur renvoie le cookie tout seul sur les routes protégées.
const cookieAuthSecurity = [{ cookieAuth: [] }];

const unauthorizedResponse = {
  description:
    "Non connecté (pas de cookie), jeton invalide ou expiré, ou compte supprimé",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      examples: {
        missingToken: {
          summary: "Pas de cookie",
          value: { message: "Authentification requise" },
        },
        invalidToken: {
          summary: "Jeton invalide ou expiré",
          value: { message: "Session invalide ou expirée" },
        },
      },
    },
  },
};

const adminForbiddenResponse = {
  description: "Connecté, mais le rôle n'est pas admin",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { message: "Accès réservé aux administrateurs" },
    },
  },
};

const beerReviewSchema = {
  type: "object",
  properties: {
    id: { type: "integer", description: "Identifiant unique de l'avis" },
    grade: { type: "integer", minimum: 1, maximum: 10 },
    comment: { type: "string", nullable: true },
    createdAt: { type: "string", format: "date-time" },
    userId: {
      type: "integer",
      description: "Auteur de l'avis : toujours l'utilisateur du jeton",
    },
    beerId: { type: "integer", description: "Bière notée" },
  },
};

const beerReviewExample = {
  id: 26,
  grade: 8,
  comment: "Belle brune, un peu sucrée",
  createdAt: "2026-09-30T12:55:52.881Z",
  userId: 2,
  beerId: 1,
};

const reviewIdParam = {
  name: "reviewId",
  in: "path",
  required: true,
  description: "Identifiant de l'avis (entier positif)",
  schema: { type: "integer", minimum: 1 },
};

const reviewNotFoundResponse = {
  description: "Avis inexistant, ou rattaché à une autre bière que {id}",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { message: "Avis non trouvé" },
    },
  },
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

const breweryNameConflictResponse = {
  description: "Une brasserie avec ce name existe déjà",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { message: "Une brasserie de ce nom existe déjà" },
    },
  },
};

const categoryIdParam = {
  name: "id",
  in: "path",
  required: true,
  description: "Identifiant de la catégorie (entier positif)",
  schema: { type: "integer", minimum: 1 },
};

const categoryNotFoundResponse = {
  description: "Aucune catégorie avec cet id",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { message: "Catégorie non trouvée" },
    },
  },
};

const categoryNameConflictResponse = {
  description: "Une catégorie avec ce name existe déjà",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { message: "Une catégorie de ce nom existe déjà" },
    },
  },
};

const ingredientIdParam = {
  name: "id",
  in: "path",
  required: true,
  description: "Identifiant de l'ingrédient (entier positif)",
  schema: { type: "integer", minimum: 1 },
};

const ingredientNotFoundResponse = {
  description: "Aucun ingrédient avec cet id",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { message: "Ingrédient non trouvé" },
    },
  },
};

const ingredientNameConflictResponse = {
  description: "Un ingrédient avec ce name existe déjà",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { message: "Un ingrédient de ce nom existe déjà" },
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
      BeerPhoto: beerPhotoSchema,
      Brewery: brewerySchema,
      BreweryPhoto: breweryPhotoSchema,
      Category: categorySchema,
      Ingredient: ingredientSchema,
      User: userSchema,
      BeerReview: beerReviewSchema,
      Error: errorSchema,
    },
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "zythologue_auth",
        description:
          "JWT déposé par POST /auth/login dans un cookie httpOnly. Se connecter via /auth/login dans Swagger UI suffit : le navigateur renvoie ensuite le cookie automatiquement.",
      },
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
            name: "categoryId",
            in: "query",
            description: "Filtre les bières associées à une catégorie donnée",
            schema: { type: "integer", minimum: 1 },
          },
          {
            name: "ingredientId",
            in: "query",
            description: "Filtre les bières associées à un ingrédient donné",
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
        security: cookieAuthSecurity,
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
          "401": unauthorizedResponse,
          "403": adminForbiddenResponse,
          "201": {
            description: "Bière créée",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Beer" },
                example: beerDetailExample,
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
                example: beerDetailExample,
              },
            },
          },
          "400": idInvalidResponse,
          "404": beerNotFoundResponse,
        },
      },
      patch: {
        security: cookieAuthSecurity,
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
          "401": unauthorizedResponse,
          "403": adminForbiddenResponse,
          "200": {
            description: "Bière mise à jour",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Beer" },
                example: beerDetailExample,
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
        security: cookieAuthSecurity,
        summary: "Supprime une bière par son identifiant",
        parameters: [idParam],
        responses: {
          "401": unauthorizedResponse,
          "403": adminForbiddenResponse,
          "204": { description: "Bière supprimée" },
          "400": idInvalidResponse,
          "404": beerNotFoundResponse,
        },
      },
    },
    "/beers/{id}/categories": {
      post: {
        security: cookieAuthSecurity,
        summary: "Associe une catégorie à une bière",
        parameters: [idParam],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  categoryId: { type: "integer", minimum: 1 },
                },
                required: ["categoryId"],
              },
              example: { categoryId: 1 },
            },
          },
        },
        responses: {
          "401": unauthorizedResponse,
          "403": adminForbiddenResponse,
          "201": {
            description: "Catégorie associée (renvoie la catégorie)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Category" },
                example: categoryExample,
              },
            },
          },
          "400": {
            description: "id non conforme, ou body invalide",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Données invalides", errors: {} },
              },
            },
          },
          "404": {
            description: "Aucune bière ou aucune catégorie avec cet id",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Catégorie non trouvée" },
              },
            },
          },
          "409": {
            description: "Cette catégorie est déjà associée à cette bière",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: {
                  message: "Cette catégorie est déjà associée à cette bière",
                },
              },
            },
          },
        },
      },
    },
    "/beers/{id}/categories/{categoryId}": {
      delete: {
        security: cookieAuthSecurity,
        summary: "Dissocie une catégorie d'une bière",
        parameters: [
          idParam,
          {
            name: "categoryId",
            in: "path",
            required: true,
            description: "Identifiant de la catégorie (entier positif)",
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "401": unauthorizedResponse,
          "403": adminForbiddenResponse,
          "204": { description: "Catégorie dissociée" },
          "400": idInvalidResponse,
          "404": {
            description: "Aucune association entre cette bière et cette catégorie",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Association catégorie/bière non trouvée" },
              },
            },
          },
        },
      },
    },
    "/beers/{id}/ingredients": {
      post: {
        security: cookieAuthSecurity,
        summary: "Associe un ingrédient à une bière",
        parameters: [idParam],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  ingredientId: { type: "integer", minimum: 1 },
                },
                required: ["ingredientId"],
              },
              example: { ingredientId: 1 },
            },
          },
        },
        responses: {
          "401": unauthorizedResponse,
          "403": adminForbiddenResponse,
          "201": {
            description: "Ingrédient associé (renvoie l'ingrédient)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Ingredient" },
                example: ingredientExample,
              },
            },
          },
          "400": {
            description: "id non conforme, ou body invalide",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Données invalides", errors: {} },
              },
            },
          },
          "404": {
            description: "Aucune bière ou aucun ingrédient avec cet id",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Ingrédient non trouvé" },
              },
            },
          },
          "409": {
            description: "Cet ingrédient est déjà associé à cette bière",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: {
                  message: "Cet ingrédient est déjà associé à cette bière",
                },
              },
            },
          },
        },
      },
    },
    "/beers/{id}/ingredients/{ingredientId}": {
      delete: {
        security: cookieAuthSecurity,
        summary: "Dissocie un ingrédient d'une bière",
        parameters: [
          idParam,
          {
            name: "ingredientId",
            in: "path",
            required: true,
            description: "Identifiant de l'ingrédient (entier positif)",
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "401": unauthorizedResponse,
          "403": adminForbiddenResponse,
          "204": { description: "Ingrédient dissocié" },
          "400": idInvalidResponse,
          "404": {
            description: "Aucune association entre cette bière et cet ingrédient",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: {
                  message: "Association ingrédient/bière non trouvée",
                },
              },
            },
          },
        },
      },
    },
    "/beers/{id}/photos": {
      get: {
        summary: "Liste les photos d'une bière, par ordre chronologique",
        parameters: [idParam],
        responses: {
          "200": {
            description: "Succès (tableau éventuellement vide)",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/BeerPhoto" },
                },
                example: [beerPhotoExample],
              },
            },
          },
          "400": idInvalidResponse,
          "404": beerNotFoundResponse,
        },
      },
      post: {
        security: cookieAuthSecurity,
        summary: "Envoie une photo pour une bière",
        description:
          "Le fichier est reçu en mémoire par Multer (5 Mo max), puis décodé par Sharp : un fichier qui n'est pas réellement une image est rejeté, quel que soit son nom ou son Content-Type déclaré. L'image acceptée est ré-encodée en WebP en deux variantes (1200 px et vignette 320 x 320), ses métadonnées EXIF sont supprimées et son nom est régénéré côté serveur.",
        parameters: [idParam],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  photo: {
                    type: "string",
                    format: "binary",
                    description: "Fichier JPEG, PNG, WebP ou AVIF (5 Mo maximum)",
                  },
                },
                required: ["photo"],
              },
            },
          },
        },
        responses: {
          "401": unauthorizedResponse,
          "403": adminForbiddenResponse,
          "201": {
            description: "Photo enregistrée",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BeerPhoto" },
                example: beerPhotoExample,
              },
            },
          },
          "400": {
            description:
              "Identifiant non conforme, aucun fichier reçu, fichier qui n'est pas une image, ou dimensions hors bornes",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Le fichier envoyé n'est pas une image valide" },
              },
            },
          },
          "404": beerNotFoundResponse,
          "409": {
            description: "La bière a atteint le nombre maximum de photos (10)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: {
                  message: "Cette bière a déjà le nombre maximum de photos",
                },
              },
            },
          },
          "413": {
            description: "Fichier au-delà de la limite de taille",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Fichier trop volumineux (5 Mo maximum)" },
              },
            },
          },
          "415": {
            description: "Format d'image non supporté",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: {
                  message:
                    "Format d'image non supporté (JPEG, PNG, WebP ou AVIF attendu)",
                },
              },
            },
          },
        },
      },
    },
    "/beers/{id}/photos/{photoId}": {
      delete: {
        security: cookieAuthSecurity,
        summary: "Supprime une photo d'une bière",
        description:
          "Supprime la ligne puis, uniquement si l'URL est une URL générée par l'API, les fichiers correspondants sur disque. Une photo pointant vers une URL externe est retirée de la base sans suppression de fichier.",
        parameters: [
          idParam,
          {
            name: "photoId",
            in: "path",
            required: true,
            description: "Identifiant de la photo (entier positif)",
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "401": unauthorizedResponse,
          "403": adminForbiddenResponse,
          "204": { description: "Photo supprimée" },
          "400": idInvalidResponse,
          "404": {
            description: "Aucune photo avec cet id pour cette bière",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Photo non trouvée" },
              },
            },
          },
        },
      },
    },
    "/beers/{id}/reviews": {
      get: {
        summary: "Liste les avis d'une bière (public)",
        parameters: [idParam],
        responses: {
          "200": {
            description: "Succès",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/BeerReview" },
                },
                example: [beerReviewExample],
              },
            },
          },
          "400": idInvalidResponse,
          "404": beerNotFoundResponse,
        },
      },
      post: {
        summary: "Ajoute l'avis de l'utilisateur connecté sur une bière",
        description:
          "L'auteur (userId) est toujours l'utilisateur du jeton : une clé userId envoyée dans le body est ignorée. Un seul avis par personne et par bière.",
        security: cookieAuthSecurity,
        parameters: [idParam],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  grade: { type: "integer", minimum: 1, maximum: 10 },
                  comment: {
                    type: "string",
                    nullable: true,
                    description: "Non vide (après trim) si fourni",
                  },
                },
                required: ["grade"],
              },
              example: { grade: 8, comment: "Belle brune, un peu sucrée" },
            },
          },
        },
        responses: {
          "201": {
            description: "Avis créé",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BeerReview" },
                example: beerReviewExample,
              },
            },
          },
          "400": {
            description: "Body invalide ou identifiant non conforme",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Données invalides", errors: {} },
              },
            },
          },
          "401": unauthorizedResponse,
          "404": beerNotFoundResponse,
          "409": {
            description: "L'utilisateur a déjà donné son avis sur cette bière",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: {
                  message: "Vous avez déjà donné votre avis sur cette bière",
                },
              },
            },
          },
        },
      },
    },
    "/beers/{id}/reviews/{reviewId}": {
      patch: {
        summary: "Modifie partiellement son propre avis",
        description:
          "Réservé à l'auteur de l'avis, même un admin ne modifie pas l'avis d'un autre. Au moins un champ ; comment: null efface le commentaire.",
        security: cookieAuthSecurity,
        parameters: [idParam, reviewIdParam],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  grade: { type: "integer", minimum: 1, maximum: 10 },
                  comment: { type: "string", nullable: true },
                },
              },
              example: { comment: null },
            },
          },
        },
        responses: {
          "200": {
            description: "Avis modifié",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BeerReview" },
                example: { ...beerReviewExample, comment: null },
              },
            },
          },
          "400": {
            description: "Body vide ou invalide, ou identifiant non conforme",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Données invalides", errors: {} },
              },
            },
          },
          "401": unauthorizedResponse,
          "403": {
            description: "L'avis appartient à quelqu'un d'autre",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: {
                  message: "Vous ne pouvez modifier que vos propres avis",
                },
              },
            },
          },
          "404": reviewNotFoundResponse,
        },
      },
      delete: {
        summary: "Supprime un avis (auteur ou admin)",
        description:
          "L'auteur peut supprimer son avis ; un admin peut supprimer n'importe quel avis (modération).",
        security: cookieAuthSecurity,
        parameters: [idParam, reviewIdParam],
        responses: {
          "204": { description: "Avis supprimé" },
          "400": idInvalidResponse,
          "401": unauthorizedResponse,
          "403": {
            description: "Ni auteur de l'avis, ni admin",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: {
                  message: "Vous ne pouvez supprimer que vos propres avis",
                },
              },
            },
          },
          "404": reviewNotFoundResponse,
        },
      },
    },
    "/breweries": {
      get: {
        summary: "Liste paginée de brasseries, avec filtrage et tri optionnels",
        parameters: [
          {
            name: "country",
            in: "query",
            description: "Filtre sur le pays (correspondance exacte)",
            schema: { type: "string" },
          },
          {
            name: "city",
            in: "query",
            description: "Filtre sur la ville (correspondance exacte)",
            schema: { type: "string" },
          },
          {
            name: "name",
            in: "query",
            description:
              "Recherche partielle sur le nom, insensible à la casse",
            schema: { type: "string" },
          },
          {
            name: "sortBy",
            in: "query",
            description: "Champ de tri (défaut : tri par id)",
            schema: { type: "string", enum: ["name"] },
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
                      items: { $ref: "#/components/schemas/Brewery" },
                    },
                    page: { type: "integer" },
                    limit: { type: "integer" },
                    total: { type: "integer" },
                    totalPages: { type: "integer" },
                  },
                },
                example: {
                  data: [breweryExample],
                  page: 1,
                  limit: 5,
                  total: 21,
                  totalPages: 5,
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
        security: cookieAuthSecurity,
        summary: "Crée une nouvelle brasserie",
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
                    description:
                      "Non vide (après trim), doit être unique en base",
                  },
                  description: {
                    type: "string",
                    description: "Non vide (après trim), obligatoire",
                  },
                  country: { type: "string", maxLength: 100 },
                  city: { type: "string", maxLength: 100 },
                  website: {
                    type: "string",
                    format: "uri",
                    nullable: true,
                    description: "URL valide si fourni, null accepté",
                  },
                },
                required: ["name", "description", "country", "city"],
              },
              example: {
                name: "Brasserie d'Achouffe",
                description: "Brasserie ardennaise fondée en 1982",
                country: "Belgique",
                city: "Achouffe",
                website: "https://www.achouffe.be",
              },
            },
          },
        },
        responses: {
          "401": unauthorizedResponse,
          "403": adminForbiddenResponse,
          "201": {
            description: "Brasserie créée (beerCount vaut 0)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Brewery" },
                example: { ...breweryExample, beerCount: 0 },
              },
            },
          },
          "400": {
            description: "Body invalide (champ manquant, type incorrect)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Données invalides", errors: {} },
              },
            },
          },
          "409": breweryNameConflictResponse,
        },
      },
    },
    "/breweries/{id}": {
      get: {
        summary: "Récupère une brasserie par son identifiant",
        parameters: [breweryIdParam],
        responses: {
          "200": {
            description: "Brasserie trouvée",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Brewery" },
                example: breweryExample,
              },
            },
          },
          "400": idInvalidResponse,
          "404": breweryNotFoundResponse,
        },
      },
      patch: {
        security: cookieAuthSecurity,
        summary:
          "Modifie partiellement une brasserie existante (seuls les champs envoyés sont modifiés)",
        parameters: [breweryIdParam],
        requestBody: {
          required: true,
          description:
            "Tous les champs sont optionnels, mais au moins un doit être fourni. website accepte null pour effacer la valeur.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", maxLength: 255 },
                  description: { type: "string" },
                  country: { type: "string", maxLength: 100 },
                  city: { type: "string", maxLength: 100 },
                  website: { type: "string", format: "uri", nullable: true },
                },
              },
              example: { city: "Houffalize" },
            },
          },
        },
        responses: {
          "401": unauthorizedResponse,
          "403": adminForbiddenResponse,
          "200": {
            description: "Brasserie mise à jour",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Brewery" },
                example: breweryExample,
              },
            },
          },
          "400": {
            description: "id non conforme, ou body vide/invalide",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Aucun champ à modifier" },
              },
            },
          },
          "404": breweryNotFoundResponse,
          "409": breweryNameConflictResponse,
        },
      },
      delete: {
        security: cookieAuthSecurity,
        summary: "Supprime une brasserie par son identifiant",
        description:
          "Suppression en cascade : les bières de la brasserie, leurs photos, ainsi que les photos, avis et favoris de la brasserie sont supprimés avec elle. Les fichiers image correspondants sont effacés du disque.",
        parameters: [breweryIdParam],
        responses: {
          "401": unauthorizedResponse,
          "403": adminForbiddenResponse,
          "204": { description: "Brasserie supprimée" },
          "400": idInvalidResponse,
          "404": breweryNotFoundResponse,
        },
      },
    },
    "/breweries/{id}/photos": {
      get: {
        summary: "Liste les photos d'une brasserie, par ordre chronologique",
        parameters: [breweryIdParam],
        responses: {
          "200": {
            description: "Succès (tableau éventuellement vide)",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/BreweryPhoto" },
                },
                example: [breweryPhotoExample],
              },
            },
          },
          "400": idInvalidResponse,
          "404": breweryNotFoundResponse,
        },
      },
      post: {
        security: cookieAuthSecurity,
        summary: "Envoie une photo pour une brasserie",
        description:
          "Même pipeline que les photos de bières : Multer reçoit le fichier en mémoire (5 Mo max), Sharp le décode pour vérifier qu'il s'agit réellement d'une image, puis le ré-encode en WebP en deux variantes (1200 px et vignette 320 x 320). Les métadonnées EXIF sont supprimées et le nom est régénéré côté serveur.",
        parameters: [breweryIdParam],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  photo: {
                    type: "string",
                    format: "binary",
                    description: "Fichier JPEG, PNG, WebP ou AVIF (5 Mo maximum)",
                  },
                },
                required: ["photo"],
              },
            },
          },
        },
        responses: {
          "401": unauthorizedResponse,
          "403": adminForbiddenResponse,
          "201": {
            description: "Photo enregistrée",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BreweryPhoto" },
                example: breweryPhotoExample,
              },
            },
          },
          "400": {
            description:
              "Identifiant non conforme, aucun fichier reçu, fichier qui n'est pas une image, ou dimensions hors bornes",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Le fichier envoyé n'est pas une image valide" },
              },
            },
          },
          "404": breweryNotFoundResponse,
          "409": {
            description: "La brasserie a atteint le nombre maximum de photos (10)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: {
                  message: "Cette brasserie a déjà le nombre maximum de photos",
                },
              },
            },
          },
          "413": {
            description: "Fichier au-delà de la limite de taille",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Fichier trop volumineux (5 Mo maximum)" },
              },
            },
          },
          "415": {
            description: "Format d'image non supporté",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: {
                  message:
                    "Format d'image non supporté (JPEG, PNG, WebP ou AVIF attendu)",
                },
              },
            },
          },
        },
      },
    },
    "/breweries/{id}/photos/{photoId}": {
      delete: {
        security: cookieAuthSecurity,
        summary: "Supprime une photo d'une brasserie",
        description:
          "Supprime la ligne puis, uniquement si l'URL est une URL générée par l'API, les fichiers correspondants sur disque. Une photo pointant vers une URL externe est retirée de la base sans suppression de fichier.",
        parameters: [
          breweryIdParam,
          {
            name: "photoId",
            in: "path",
            required: true,
            description: "Identifiant de la photo (entier positif)",
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "401": unauthorizedResponse,
          "403": adminForbiddenResponse,
          "204": { description: "Photo supprimée" },
          "400": idInvalidResponse,
          "404": {
            description: "Aucune photo avec cet id pour cette brasserie",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Photo non trouvée" },
              },
            },
          },
        },
      },
    },
    "/categories": {
      get: {
        summary: "Liste paginée de catégories, avec filtrage et tri optionnels",
        parameters: [
          {
            name: "name",
            in: "query",
            description:
              "Recherche partielle sur le nom, insensible à la casse",
            schema: { type: "string" },
          },
          {
            name: "sortBy",
            in: "query",
            description: "Champ de tri (défaut : tri par id)",
            schema: { type: "string", enum: ["name"] },
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
                      items: { $ref: "#/components/schemas/Category" },
                    },
                    page: { type: "integer" },
                    limit: { type: "integer" },
                    total: { type: "integer" },
                    totalPages: { type: "integer" },
                  },
                },
                example: {
                  data: [categoryExample],
                  page: 1,
                  limit: 5,
                  total: 8,
                  totalPages: 2,
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
        security: cookieAuthSecurity,
        summary: "Crée une nouvelle catégorie",
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
                    description:
                      "Non vide (après trim), doit être unique en base",
                  },
                  description: {
                    type: "string",
                    description: "Non vide (après trim), obligatoire",
                  },
                },
                required: ["name", "description"],
              },
              example: {
                name: "IPA",
                description: "Bières houblonnées, amères et souvent fruitées",
              },
            },
          },
        },
        responses: {
          "401": unauthorizedResponse,
          "403": adminForbiddenResponse,
          "201": {
            description: "Catégorie créée",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Category" },
                example: categoryExample,
              },
            },
          },
          "400": {
            description: "Body invalide (champ manquant, type incorrect)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Données invalides", errors: {} },
              },
            },
          },
          "409": categoryNameConflictResponse,
        },
      },
    },
    "/categories/{id}": {
      get: {
        summary: "Récupère une catégorie par son identifiant",
        parameters: [categoryIdParam],
        responses: {
          "200": {
            description: "Catégorie trouvée",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Category" },
                example: categoryExample,
              },
            },
          },
          "400": idInvalidResponse,
          "404": categoryNotFoundResponse,
        },
      },
      patch: {
        security: cookieAuthSecurity,
        summary:
          "Modifie partiellement une catégorie existante (seuls les champs envoyés sont modifiés)",
        parameters: [categoryIdParam],
        requestBody: {
          required: true,
          description: "Tous les champs sont optionnels, mais au moins un doit être fourni.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", maxLength: 255 },
                  description: { type: "string" },
                },
              },
              example: { description: "Bières houblonnées et amères" },
            },
          },
        },
        responses: {
          "401": unauthorizedResponse,
          "403": adminForbiddenResponse,
          "200": {
            description: "Catégorie mise à jour",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Category" },
                example: categoryExample,
              },
            },
          },
          "400": {
            description: "id non conforme, ou body vide/invalide",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Aucun champ à modifier" },
              },
            },
          },
          "404": categoryNotFoundResponse,
          "409": categoryNameConflictResponse,
        },
      },
      delete: {
        security: cookieAuthSecurity,
        summary: "Supprime une catégorie par son identifiant",
        description:
          "Suppression en cascade : les associations avec les bières (beer_category) sont supprimées avec elle. Aucune photo ni fichier associé, contrairement à brewery/beer.",
        parameters: [categoryIdParam],
        responses: {
          "401": unauthorizedResponse,
          "403": adminForbiddenResponse,
          "204": { description: "Catégorie supprimée" },
          "400": idInvalidResponse,
          "404": categoryNotFoundResponse,
        },
      },
    },
    "/ingredients": {
      get: {
        summary: "Liste paginée d'ingrédients, avec filtrage et tri optionnels",
        parameters: [
          {
            name: "name",
            in: "query",
            description:
              "Recherche partielle sur le nom, insensible à la casse",
            schema: { type: "string" },
          },
          {
            name: "sortBy",
            in: "query",
            description: "Champ de tri (défaut : tri par id)",
            schema: { type: "string", enum: ["name"] },
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
                      items: { $ref: "#/components/schemas/Ingredient" },
                    },
                    page: { type: "integer" },
                    limit: { type: "integer" },
                    total: { type: "integer" },
                    totalPages: { type: "integer" },
                  },
                },
                example: {
                  data: [ingredientExample],
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
        security: cookieAuthSecurity,
        summary: "Crée un nouvel ingrédient",
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
                    description:
                      "Non vide (après trim), doit être unique en base",
                  },
                  description: {
                    type: "string",
                    nullable: true,
                    description: "Optionnelle, null accepté",
                  },
                },
                required: ["name"],
              },
              example: {
                name: "Houblon Saaz",
                description: "Houblon noble tchèque, notes florales et épicées",
              },
            },
          },
        },
        responses: {
          "401": unauthorizedResponse,
          "403": adminForbiddenResponse,
          "201": {
            description: "Ingrédient créé",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Ingredient" },
                example: ingredientExample,
              },
            },
          },
          "400": {
            description: "Body invalide (champ manquant, type incorrect)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Données invalides", errors: {} },
              },
            },
          },
          "409": ingredientNameConflictResponse,
        },
      },
    },
    "/ingredients/{id}": {
      get: {
        summary: "Récupère un ingrédient par son identifiant",
        parameters: [ingredientIdParam],
        responses: {
          "200": {
            description: "Ingrédient trouvé",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Ingredient" },
                example: ingredientExample,
              },
            },
          },
          "400": idInvalidResponse,
          "404": ingredientNotFoundResponse,
        },
      },
      patch: {
        security: cookieAuthSecurity,
        summary:
          "Modifie partiellement un ingrédient existant (seuls les champs envoyés sont modifiés)",
        parameters: [ingredientIdParam],
        requestBody: {
          required: true,
          description:
            "Tous les champs sont optionnels, mais au moins un doit être fourni. description accepte null pour effacer la valeur.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", maxLength: 255 },
                  description: { type: "string", nullable: true },
                },
              },
              example: { description: "Houblon noble tchèque" },
            },
          },
        },
        responses: {
          "401": unauthorizedResponse,
          "403": adminForbiddenResponse,
          "200": {
            description: "Ingrédient mis à jour",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Ingredient" },
                example: ingredientExample,
              },
            },
          },
          "400": {
            description: "id non conforme, ou body vide/invalide",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Aucun champ à modifier" },
              },
            },
          },
          "404": ingredientNotFoundResponse,
          "409": ingredientNameConflictResponse,
        },
      },
      delete: {
        security: cookieAuthSecurity,
        summary: "Supprime un ingrédient par son identifiant",
        description:
          "Suppression en cascade : les associations avec les bières (beer_ingredient) sont supprimées avec lui. Aucune photo ni fichier associé.",
        parameters: [ingredientIdParam],
        responses: {
          "401": unauthorizedResponse,
          "403": adminForbiddenResponse,
          "204": { description: "Ingrédient supprimé" },
          "400": idInvalidResponse,
          "404": ingredientNotFoundResponse,
        },
      },
    },
    "/beer-logs": {
      get: {
        security: cookieAuthSecurity,
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
          "401": unauthorizedResponse,
          "403": adminForbiddenResponse,
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
    "/auth/register": {
      post: {
        summary: "Crée un compte utilisateur",
        description:
          "Le mot de passe est haché (argon2id) avant stockage et n'est jamais renvoyé. Toute clé non listée (par exemple role) est ignorée : un compte est toujours créé avec le rôle client.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  lastName: {
                    type: "string",
                    maxLength: 100,
                    description: "Non vide (après trim)",
                  },
                  firstName: {
                    type: "string",
                    maxLength: 100,
                    description: "Non vide (après trim)",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    maxLength: 255,
                    description:
                      "Converti en minuscules, doit être unique en base",
                  },
                  birthDate: {
                    type: "string",
                    format: "date",
                    description:
                      "YYYY-MM-DD, au moins 18 ans, postérieure au 1900-01-01",
                  },
                  password: {
                    type: "string",
                    minLength: 8,
                    maxLength: 255,
                    description:
                      "Au moins une minuscule, une majuscule, un chiffre et un caractère spécial",
                  },
                },
                required: [
                  "lastName",
                  "firstName",
                  "email",
                  "birthDate",
                  "password",
                ],
              },
              example: {
                lastName: "Durand",
                firstName: "Jean",
                email: "jean.durand@example.com",
                birthDate: "1995-06-15",
                password: "Motdepasse123!",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Compte créé",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
                example: userExample,
              },
            },
          },
          "400": {
            description:
              "Body invalide (champ manquant, email invalide, mineur, mot de passe faible)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Données invalides", errors: {} },
              },
            },
          },
          "409": {
            description: "Un compte existe déjà avec cet email",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: { message: "Un compte existe déjà avec cet email" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Identifie un utilisateur par email et mot de passe",
        description:
          "En cas de succès, le JWT (HS256, valable 1 h, payload sub + role) est déposé dans le cookie httpOnly zythologue_auth ; il n'apparaît jamais dans le body. Limité à 5 échecs par IP sur 15 minutes (les connexions réussies ne sont pas comptées).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    description: "Converti en minuscules",
                  },
                  password: { type: "string", minLength: 1, maxLength: 255 },
                },
                required: ["email", "password"],
              },
              example: {
                email: "jean.durand@example.com",
                password: "Motdepasse123!",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Identification réussie",
            headers: {
              "Set-Cookie": {
                description:
                  "zythologue_auth=<JWT>; HttpOnly; SameSite=Strict; Max-Age=3600 (+ Secure si NODE_ENV=production)",
                schema: { type: "string" },
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { message: { type: "string" } },
                },
                example: { message: "Connexion réussie" },
              },
            },
          },
          "400": {
            description:
              "Body invalide, ou email inconnu / mot de passe incorrect (message identique dans ces deux cas, pour ne pas révéler l'existence d'un compte)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                examples: {
                  invalidBody: {
                    summary: "Body invalide",
                    value: { message: "Données invalides", errors: {} },
                  },
                  invalidCredentials: {
                    summary: "Identifiants incorrects",
                    value: { message: "Email ou mot de passe incorrect" },
                  },
                },
              },
            },
          },
          "429": {
            description:
              "Plus de 5 échecs en 15 minutes depuis la même IP. Les en-têtes RateLimit et Retry-After indiquent le délai restant.",
            headers: {
              "Retry-After": {
                description: "Secondes avant de pouvoir réessayer",
                schema: { type: "integer" },
              },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
                example: {
                  message:
                    "Trop de tentatives de connexion, réessayez dans 15 minutes",
                },
              },
            },
          },
        },
      },
    },
    "/auth/me": {
      get: {
        summary: "Renvoie l'utilisateur connecté",
        description:
          "Renvoie res.locals.user, déposé par le middleware authenticate (cookie lu, JWT vérifié, utilisateur rechargé en base).",
        security: cookieAuthSecurity,
        responses: {
          "200": {
            description: "Jeton valide",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
                example: userExample,
              },
            },
          },
          "401": unauthorizedResponse,
        },
      },
    },
  },
};
