import { createIngredientSchema } from "@zythologue/shared";
import { z } from "zod";

// Description facultative : textarea vide → null (l'API refuse une chaîne vide)
export const ingredientFormSchema = z.preprocess((raw) => {
  const form = raw as Record<string, unknown>;
  return {
    name: form.name,
    description:
      typeof form.description === "string" && form.description.trim() !== ""
        ? form.description
        : null,
  };
}, createIngredientSchema);
