import { z } from "zod";
import { idSchema } from "./idSchema.ts";

// Schémas du body : partagés avec le dashboard (formulaire catégorie)
export {
  createCategorySchema,
  patchCategorySchema,
  type CreateCategoryInput,
  type PatchCategoryInput,
} from "@zythologue/shared";

// Ici, seulement ce qui ne concerne que le serveur : query string et params
export const getCategoriesQuerySchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    sortBy: z.enum(["name"]).optional(),
    order: z.enum(["asc", "desc"]).default("asc"),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(5),
  })
  .strict();

export type GetCategoriesQuery = z.infer<typeof getCategoriesQuerySchema>;

export const categoryIdParamSchema = z.object({
  id: idSchema,
});

export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>;
