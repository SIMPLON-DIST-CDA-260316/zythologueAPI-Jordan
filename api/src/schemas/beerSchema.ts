import { z } from "zod";

// Schémas du body : partagés avec le dashboard (formulaire bière)
export {
  createBeerSchema,
  patchBeerSchema,
  type CreateBeerInput,
  type PatchBeerInput,
} from "@zythologue/shared";

// Ici, seulement ce qui ne concerne que le serveur : query string et params
export const getBeersQuerySchema = z
  .object({
    breweryId: z.coerce.number().int().positive().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    ingredientId: z.coerce.number().int().positive().optional(),
    isAlcoholFree: z
      .enum(["true", "false"])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === "true")),
    // Vide (barre de recherche effacée) = pas de filtre, géré par le repository
    search: z.string().trim().max(100).optional(),
    sortBy: z.enum(["price", "alcoholLevel"]).optional(),
    order: z.enum(["asc", "desc"]).default("asc"),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(5),
  })
  .strict();

export type GetBeersQuery = z.infer<typeof getBeersQuerySchema>;

export const beerIdParamSchema = z.object({
  id: z.coerce
    .number("L'identifiant n'est pas conforme")
    .int("L'identifiant n'est pas conforme")
    .positive("L'identifiant n'est pas conforme"),
});

export type BeerIdParam = z.infer<typeof beerIdParamSchema>;
