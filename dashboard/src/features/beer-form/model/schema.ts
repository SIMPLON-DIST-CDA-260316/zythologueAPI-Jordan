import { createBeerSchema } from "@zythologue/shared";
import { z } from "zod";

// "" → undefined et pas Number("") qui vaut 0 : un prix vide passerait
const toNumber = (value: unknown) =>
  typeof value === "string" && value.trim() !== "" ? Number(value) : undefined;

// FormData ne donne que des chaînes : on les convertit, puis on valide avec le
// schéma partagé tel quel (.extend est interdit sur un schéma avec .refine).
// isAlcoholFree n'est pas saisi : il découle du degré, comme l'exige l'API.
export const beerFormSchema = z.preprocess((raw) => {
  const form = raw as Record<string, unknown>;
  const alcoholLevel = toNumber(form.alcoholLevel);
  return {
    name: form.name,
    description:
      typeof form.description === "string" && form.description.trim() !== ""
        ? form.description
        : null,
    price: toNumber(form.price),
    alcoholLevel,
    isAlcoholFree: alcoholLevel !== undefined && alcoholLevel < 0.5,
    breweryId: toNumber(form.breweryId),
  };
}, createBeerSchema);
