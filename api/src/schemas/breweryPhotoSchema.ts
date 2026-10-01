import { z } from "zod";

export const breweryPhotoParamsSchema = z.object({
  id: z.coerce
    .number("L'identifiant n'est pas conforme")
    .int("L'identifiant n'est pas conforme")
    .positive("L'identifiant n'est pas conforme"),
  photoId: z.coerce
    .number("L'identifiant n'est pas conforme")
    .int("L'identifiant n'est pas conforme")
    .positive("L'identifiant n'est pas conforme"),
});

export type BreweryPhotoParams = z.infer<typeof breweryPhotoParamsSchema>;
