import { z } from "zod";

export const createBeerSchema = z
  .object({
    name: z
      .string("Ce champ doit être une chaîne de caractères")
      .trim()
      .min(1, "Le champ doit comprendre au moins 1 caractère")
      .max(255),
    description: z.string().trim().min(1).nullable().optional(),
    price: z.number().nonnegative(),
    alcoholLevel: z.number().nonnegative(),
    isAlcoholFree: z.boolean(),
    breweryId: z.number().int().positive(),
  })
  .refine((beer) => beer.isAlcoholFree === beer.alcoholLevel < 0.5, {
    message:
      "isAlcoholFree doit correspondre au taux d'alcool (sans alcool si < 0.5%, avec alcool sinon)",
    path: ["alcoholLevel"],
  });

export type CreateBeerInput = z.infer<typeof createBeerSchema>;

export const patchBeerSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().min(1).nullable().optional(),
    price: z.number().nonnegative().optional(),
    alcoholLevel: z.number().nonnegative().optional(),
    isAlcoholFree: z.boolean().optional(),
    breweryId: z.number().int().positive().optional(),
  })
  .refine((beer) => Object.keys(beer).length > 0, {
    message: "Aucun champ à modifier",
  });

export type PatchBeerInput = z.infer<typeof patchBeerSchema>;

export const getBeersQuerySchema = z
  .object({
    breweryId: z.coerce.number().int().positive().optional(),
    isAlcoholFree: z
      .enum(["true", "false"])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === "true")),
    sortBy: z.enum(["price", "alcoholLevel"]).optional(),
    order: z.enum(["asc", "desc"]).default("asc"),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(5),
  })
  .strict();

export type GetBeersQuery = z.infer<typeof getBeersQuerySchema>;

export const beerIdParamSchema = z.object({
  id: z.coerce
    .number("L'identifiant n'est pas conforme")
    .int("L'identifiant n'est pas conforme")
    .positive("L'identifiant n'est pas conforme"),
});

export type BeerIdParam = z.infer<typeof beerIdParamSchema>;
