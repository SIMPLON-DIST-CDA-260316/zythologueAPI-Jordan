import { z } from "zod";
import { idSchema } from "./idSchema.ts";

export const beerPhotoParamsSchema = z.object({
  id: idSchema,
  photoId: idSchema,
});

export type BeerPhotoParams = z.infer<typeof beerPhotoParamsSchema>;
