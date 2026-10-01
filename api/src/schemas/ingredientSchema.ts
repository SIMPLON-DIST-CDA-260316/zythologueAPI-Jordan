import { z } from "zod";

export const createIngredientSchema = z.object({
  name: z
    .string("Ce champ doit être une chaîne de caractères")
    .trim()
    .min(1, "Le champ doit comprendre au moins 1 caractère")
    .max(255),
  description: z.string().trim().min(1).nullable().optional(),
});

export type CreateIngredientInput = z.infer<typeof createIngredientSchema>;

export const patchIngredientSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().min(1).nullable().optional(),
  })
  .refine((ingredient) => Object.keys(ingredient).length > 0, {
    message: "Aucun champ à modifier",
  });

export type PatchIngredientInput = z.infer<typeof patchIngredientSchema>;

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
  id: z.coerce
    .number("L'identifiant n'est pas conforme")
    .int("L'identifiant n'est pas conforme")
    .positive("L'identifiant n'est pas conforme"),
});

export type IngredientIdParam = z.infer<typeof ingredientIdParamSchema>;
