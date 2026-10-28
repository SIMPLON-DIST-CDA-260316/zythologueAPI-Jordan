import {
  createBeerSchema as sharedCreateBeerSchema,
  patchBeerSchema as sharedPatchBeerSchema,
} from "@zythologue/shared";
import { z } from "zod";
import { idSchema } from "./idSchema.ts";
import { isBlankRichText, sanitizeRichText } from "./richText.ts";

export type { CreateBeerInput, PatchBeerInput } from "@zythologue/shared";

// Description facultative : vide après nettoyage = pas de description (null).
// undefined (PATCH sans description) reste undefined : le champ n'est pas modifié
const withSanitizedDescription = <T extends { description?: string | null }>(
  beer: T,
): T =>
  typeof beer.description === "string"
    ? {
        ...beer,
        description: isBlankRichText(beer.description)
          ? null
          : sanitizeRichText(beer.description),
      }
    : beer;

// Schémas du body : ceux partagés avec le dashboard (formulaire bière), plus
// le nettoyage du HTML de la description, fait uniquement côté serveur
export const createBeerSchema = sharedCreateBeerSchema.transform(
  withSanitizedDescription,
);
export const patchBeerSchema = sharedPatchBeerSchema.transform(
  withSanitizedDescription,
);

// Ici, seulement ce qui ne concerne que le serveur : query string et params
export const getBeersQuerySchema = z
  .object({
    breweryId: idSchema.optional(),
    categoryId: idSchema.optional(),
    ingredientId: idSchema.optional(),
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
  id: idSchema,
});

export type BeerIdParam = z.infer<typeof beerIdParamSchema>;
