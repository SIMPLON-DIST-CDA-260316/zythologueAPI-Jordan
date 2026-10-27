import { createBrewerySchema } from "@zythologue/shared";
import { z } from "zod";

// Site web facultatif : champ vide → null (z.url() refuserait une chaîne vide)
export const breweryFormSchema = z.preprocess((raw) => {
  const form = raw as Record<string, unknown>;
  return {
    name: form.name,
    description: form.description,
    country: form.country,
    city: form.city,
    website:
      typeof form.website === "string" && form.website.trim() !== ""
        ? form.website.trim()
        : null,
  };
}, createBrewerySchema);
