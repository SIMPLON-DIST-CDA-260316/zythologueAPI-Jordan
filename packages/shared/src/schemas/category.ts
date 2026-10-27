import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string("Ce champ doit être une chaîne de caractères")
    .trim()
    .min(1, "Le champ doit comprendre au moins 1 caractère")
    .max(255, "Le nom ne peut pas dépasser 255 caractères"),
  description: z
    .string("Ce champ doit être une chaîne de caractères")
    .trim()
    .min(1, "La description est obligatoire"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const patchCategorySchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().min(1).optional(),
  })
  .refine((category) => Object.keys(category).length > 0, {
    message: "Aucun champ à modifier",
  });

export type PatchCategoryInput = z.infer<typeof patchCategorySchema>;
