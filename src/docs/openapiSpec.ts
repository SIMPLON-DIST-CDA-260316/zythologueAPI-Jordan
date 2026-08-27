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
      BeerPhoto: beerPhotoSchema,
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
