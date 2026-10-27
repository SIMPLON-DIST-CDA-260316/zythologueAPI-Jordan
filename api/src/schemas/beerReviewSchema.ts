import { z } from "zod";
import { idSchema } from "./idSchema.ts";

const gradeSchema = z
  .number("La note doit être un nombre")
  .int("La note doit être un entier")
  .min(1, "La note doit être comprise entre 1 et 10")
  .max(10, "La note doit être comprise entre 1 et 10");

const commentSchema = z
  .string("Ce champ doit être une chaîne de caractères")
  .trim()
  .min(1, "Le commentaire ne peut pas être vide")
  .max(2000, "Le commentaire ne peut pas dépasser 2000 caractères")
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
  id: idSchema,
  reviewId: idSchema,
});
export type BeerReviewParams = z.infer<typeof beerReviewParamsSchema>;
