import { z } from "zod";

export const createIngredientSchema = z.object({
  name: z
    .string("Ce champ doit être une chaîne de caractères")
    .trim()
    .min(1, "Le champ doit comprendre au moins 1 caractère")
    .max(255, "Le nom ne peut pas dépasser 255 caractères"),
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
