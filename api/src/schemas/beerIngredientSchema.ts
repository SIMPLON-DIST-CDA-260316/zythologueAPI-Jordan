import { z } from "zod";
import { bodyIdSchema, idSchema } from "./idSchema.ts";

export const createBeerIngredientSchema = z.object({
  ingredientId: bodyIdSchema,
});

export type CreateBeerIngredientInput = z.infer<
  typeof createBeerIngredientSchema
>;

export const beerIngredientParamsSchema = z.object({
  id: idSchema,
  ingredientId: idSchema,
});

export type BeerIngredientParams = z.infer<typeof beerIngredientParamsSchema>;
