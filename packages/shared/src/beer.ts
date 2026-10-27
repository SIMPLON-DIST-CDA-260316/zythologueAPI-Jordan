import { z } from "zod";

// Bornes alignées sur les colonnes : price NUMERIC(6,2), alcohol_level NUMERIC(4,1).
// Au-delà, l'INSERT échouerait en base (500) au lieu d'un 400 lisible.
// multipleOf : sinon la base arrondit en silence (0.46 → 0.5, pourtant validé « sans alcool »).
const MAX_PRICE = 9999.99;
const MAX_ALCOHOL_LEVEL = 100;

export const createBeerSchema = z
  .object({
    name: z
      .string("Ce champ doit être une chaîne de caractères")
      .trim()
      .min(1, "Le champ doit comprendre au moins 1 caractère")
      .max(255, "Le nom ne peut pas dépasser 255 caractères"),
    description: z.string().trim().min(1).nullable().optional(),
    price: z
      .number("Le prix doit être un nombre")
      .nonnegative("Le prix ne peut pas être négatif")
      .max(MAX_PRICE, "Le prix ne peut pas dépasser 9 999,99 €")
      .multipleOf(0.01, "Le prix a au plus deux décimales"),
    alcoholLevel: z
      .number("Le degré d'alcool doit être un nombre")
      .nonnegative("Le degré d'alcool ne peut pas être négatif")
      .max(MAX_ALCOHOL_LEVEL, "Le degré d'alcool ne peut pas dépasser 100 %")
      .multipleOf(0.1, "Le degré d'alcool a au plus une décimale"),
    isAlcoholFree: z.boolean(),
    breweryId: z
      .number("Choisissez une brasserie")
      .int("Choisissez une brasserie")
      .positive("Choisissez une brasserie"),
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
    price: z.number().nonnegative().max(MAX_PRICE).multipleOf(0.01).optional(),
    alcoholLevel: z
      .number()
      .nonnegative()
      .max(MAX_ALCOHOL_LEVEL)
      .multipleOf(0.1)
      .optional(),
    isAlcoholFree: z.boolean().optional(),
    breweryId: z.number().int().positive().optional(),
  })
  .refine((beer) => Object.keys(beer).length > 0, {
    message: "Aucun champ à modifier",
  });

export type PatchBeerInput = z.infer<typeof patchBeerSchema>;
