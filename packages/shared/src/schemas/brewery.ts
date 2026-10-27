import { z } from "zod";

// http(s) seulement : z.url() accepte aussi javascript: et data:, une XSS
// stockée le jour où un front affiche le site dans un <a href>
const websiteUrl = {
  protocol: /^https?$/,
  message: "Le site web doit être une URL valide (https://…)",
};

export const createBrewerySchema = z.object({
  name: z
    .string("Ce champ doit être une chaîne de caractères")
    .trim()
    .min(1, "Le champ doit comprendre au moins 1 caractère")
    .max(255, "Le nom ne peut pas dépasser 255 caractères"),
  description: z
    .string("Ce champ doit être une chaîne de caractères")
    .trim()
    .min(1, "La description est obligatoire"),
  country: z
    .string("Ce champ doit être une chaîne de caractères")
    .trim()
    .min(1, "Le pays est obligatoire")
    .max(100, "Le pays ne peut pas dépasser 100 caractères"),
  city: z
    .string("Ce champ doit être une chaîne de caractères")
    .trim()
    .min(1, "La ville est obligatoire")
    .max(100, "La ville ne peut pas dépasser 100 caractères"),
  website: z
    .url(websiteUrl)
    .max(2048, "L'URL ne peut pas dépasser 2048 caractères")
    .nullable()
    .optional(),
});

export type CreateBreweryInput = z.infer<typeof createBrewerySchema>;

export const patchBrewerySchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().min(1).optional(),
    country: z.string().trim().min(1).max(100).optional(),
    city: z.string().trim().min(1).max(100).optional(),
    website: z.url(websiteUrl).max(2048).nullable().optional(),
  })
  .refine((brewery) => Object.keys(brewery).length > 0, {
    message: "Aucun champ à modifier",
  });

export type PatchBreweryInput = z.infer<typeof patchBrewerySchema>;
