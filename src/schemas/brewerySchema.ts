import { z } from "zod";

export const createBrewerySchema = z.object({
  name: z
    .string("Ce champ doit être une chaîne de caractères")
    .trim()
    .min(1, "Le champ doit comprendre au moins 1 caractère")
    .max(255),
  description: z.string().trim().min(1),
  country: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(100),
  website: z.url().max(2048).nullable().optional(),
});

export type CreateBreweryInput = z.infer<typeof createBrewerySchema>;

export const patchBrewerySchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().min(1).optional(),
    country: z.string().trim().min(1).max(100).optional(),
    city: z.string().trim().min(1).max(100).optional(),
    website: z.url().max(2048).nullable().optional(),
  })
  .refine((brewery) => Object.keys(brewery).length > 0, {
    message: "Aucun champ à modifier",
  });

export type PatchBreweryInput = z.infer<typeof patchBrewerySchema>;

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
  id: z.coerce
    .number("L'identifiant n'est pas conforme")
    .int("L'identifiant n'est pas conforme")
    .positive("L'identifiant n'est pas conforme"),
});

export type BreweryIdParam = z.infer<typeof breweryIdParamSchema>;
