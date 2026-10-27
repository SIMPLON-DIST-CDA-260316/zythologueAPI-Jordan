import { z } from "zod";
import { idSchema } from "./idSchema.ts";

// Schémas du body : partagés avec le dashboard (formulaire brasserie)
export {
  createBrewerySchema,
  patchBrewerySchema,
  type CreateBreweryInput,
  type PatchBreweryInput,
} from "@zythologue/shared";

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
