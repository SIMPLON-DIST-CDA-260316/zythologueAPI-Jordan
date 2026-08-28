import { z } from "zod";

export const createBeerCategorySchema = z.object({
  categoryId: z.number("L'identifiant n'est pas conforme").int().positive(),
});

export type CreateBeerCategoryInput = z.infer<typeof createBeerCategorySchema>;

export const beerCategoryParamsSchema = z.object({
  id: z.coerce
    .number("L'identifiant n'est pas conforme")
    .int("L'identifiant n'est pas conforme")
    .positive("L'identifiant n'est pas conforme"),
  categoryId: z.coerce
    .number("L'identifiant n'est pas conforme")
    .int("L'identifiant n'est pas conforme")
    .positive("L'identifiant n'est pas conforme"),
});

export type BeerCategoryParams = z.infer<typeof beerCategoryParamsSchema>;
