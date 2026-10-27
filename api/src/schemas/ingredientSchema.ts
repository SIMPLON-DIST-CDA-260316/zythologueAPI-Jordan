import { z } from "zod";
import { idSchema } from "./idSchema.ts";

// Schémas du body : partagés avec le dashboard (formulaire ingrédient)
export {
  createIngredientSchema,
  patchIngredientSchema,
  type CreateIngredientInput,
  type PatchIngredientInput,
} from "@zythologue/shared";

// Ici, seulement ce qui ne concerne que le serveur : query string et params
export const getIngredientsQuerySchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    sortBy: z.enum(["name"]).optional(),
    order: z.enum(["asc", "desc"]).default("asc"),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(5),
  })
  .strict();

export type GetIngredientsQuery = z.infer<typeof getIngredientsQuerySchema>;

export const ingredientIdParamSchema = z.object({
  id: idSchema,
});

export type IngredientIdParam = z.infer<typeof ingredientIdParamSchema>;
