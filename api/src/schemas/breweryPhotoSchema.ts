import { z } from "zod";
import { idSchema } from "./idSchema.ts";

export const breweryPhotoParamsSchema = z.object({
  id: idSchema,
  photoId: idSchema,
});

export type BreweryPhotoParams = z.infer<typeof breweryPhotoParamsSchema>;
