import { z } from "zod";

export const createBeerIngredientSchema = z.object({
  ingredientId: z
    .number("L'identifiant n'est pas conforme")
    .int()
    .positive(),
});

export type CreateBeerIngredientInput = z.infer<
  typeof createBeerIngredientSchema
>;

export const beerIngredientParamsSchema = z.object({
  id: z.coerce
    .number("L'identifiant n'est pas conforme")
    .int("L'identifiant n'est pas conforme")
    .positive("L'identifiant n'est pas conforme"),
  ingredientId: z.coerce
    .number("L'identifiant n'est pas conforme")
    .int("L'identifiant n'est pas conforme")
    .positive("L'identifiant n'est pas conforme"),
});

export type BeerIngredientParams = z.infer<typeof beerIngredientParamsSchema>;
