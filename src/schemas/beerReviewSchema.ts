import { z } from "zod";

const gradeSchema = z
  .number("La note doit être un nombre")
  .int("La note doit être un entier")
  .min(1, "La note doit être comprise entre 1 et 10")
  .max(10, "La note doit être comprise entre 1 et 10");

const commentSchema = z
  .string("Ce champ doit être une chaîne de caractères")
  .trim()
  .min(1, "Le commentaire ne peut pas être vide")
  .nullable();

export const createBeerReviewSchema = z.object({
  grade: gradeSchema,
  comment: commentSchema.optional(),
});
export type CreateBeerReviewInput = z.infer<typeof createBeerReviewSchema>;

export const patchBeerReviewSchema = z
  .object({
    grade: gradeSchema.optional(),
    comment: commentSchema.optional(),
  })
  .refine((review) => Object.keys(review).length > 0, {
    message: "Aucun champ à modifier",
  });
export type PatchBeerReviewInput = z.infer<typeof patchBeerReviewSchema>;

export const beerReviewParamsSchema = z.object({
  id: z.coerce
    .number("L'identifiant n'est pas conforme")
    .int("L'identifiant n'est pas conforme")
    .positive("L'identifiant n'est pas conforme"),
  reviewId: z.coerce
    .number("L'identifiant n'est pas conforme")
    .int("L'identifiant n'est pas conforme")
    .positive("L'identifiant n'est pas conforme"),
});
export type BeerReviewParams = z.infer<typeof beerReviewParamsSchema>;
