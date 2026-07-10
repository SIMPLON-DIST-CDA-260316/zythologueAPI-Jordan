import { z } from "zod";

export const createBeerSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    description: z.string().trim().min(1).nullable().optional(),
    price: z.number().nonnegative(),
    alcoholLevel: z.number().nonnegative(),
    isAlcoholFree: z.boolean(),
    breweryId: z.number().int().positive(),
  })
  .refine((beer) => beer.isAlcoholFree === (beer.alcoholLevel < 0.5), {
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
