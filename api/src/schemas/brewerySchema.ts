import {
  createBrewerySchema as sharedCreateBrewerySchema,
  patchBrewerySchema as sharedPatchBrewerySchema,
} from "@zythologue/shared";
import { z } from "zod";
import { idSchema } from "./idSchema.ts";
import { isBlankRichText, sanitizeRichText } from "./richText.ts";

export type { CreateBreweryInput, PatchBreweryInput } from "@zythologue/shared";

// Description obligatoire : vide après nettoyage (<p><br></p>, <script>…) = 400,
// comme une chaîne vide. undefined (PATCH sans description) passe tel quel
const withSanitizedDescription = <T extends { description?: string }>(
  brewery: T,
  ctx: z.core.$RefinementCtx<T>,
): T => {
  if (brewery.description === undefined) return brewery;
  if (isBlankRichText(brewery.description)) {
    ctx.addIssue({
      code: "custom",
      message: "La description est obligatoire",
      path: ["description"],
    });
    return z.NEVER;
  }
  return { ...brewery, description: sanitizeRichText(brewery.description) };
};

// Schémas du body : ceux partagés avec le dashboard (formulaire brasserie),
// plus le nettoyage du HTML de la description, fait uniquement côté serveur
export const createBrewerySchema = sharedCreateBrewerySchema.transform(
  withSanitizedDescription,
);
export const patchBrewerySchema = sharedPatchBrewerySchema.transform(
  withSanitizedDescription,
);

// Ici, seulement ce qui ne concerne que le serveur : query string et params
export const getBreweriesQuerySchema = z
  .object({
    country: z.string().trim().min(1).optional(),
    city: z.string().trim().min(1).optional(),
    name: z.string().trim().min(1).optional(),
    sortBy: z.enum(["name"]).optional(),
    order: z.enum(["asc", "desc"]).default("asc"),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(5),
  })
  .strict();

export type GetBreweriesQuery = z.infer<typeof getBreweriesQuerySchema>;

export const breweryIdParamSchema = z.object({
  id: idSchema,
});

export type BreweryIdParam = z.infer<typeof breweryIdParamSchema>;
