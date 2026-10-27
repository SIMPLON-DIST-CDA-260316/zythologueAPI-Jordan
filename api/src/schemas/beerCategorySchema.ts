import { z } from "zod";
import { bodyIdSchema, idSchema } from "./idSchema.ts";

export const createBeerCategorySchema = z.object({
  categoryId: bodyIdSchema,
});

export type CreateBeerCategoryInput = z.infer<typeof createBeerCategorySchema>;

export const beerCategoryParamsSchema = z.object({
  id: idSchema,
  categoryId: idSchema,
});

export type BeerCategoryParams = z.infer<typeof beerCategoryParamsSchema>;
