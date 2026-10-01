import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string("Ce champ doit être une chaîne de caractères")
    .trim()
    .min(1, "Le champ doit comprendre au moins 1 caractère")
    .max(255),
  description: z.string().trim().min(1),
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
  id: z.coerce
    .number("L'identifiant n'est pas conforme")
    .int("L'identifiant n'est pas conforme")
    .positive("L'identifiant n'est pas conforme"),
});

export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>;
