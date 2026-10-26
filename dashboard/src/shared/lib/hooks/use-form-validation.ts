import type { ApiError } from "@/shared/api";
import { useState } from "react";
import { z } from "zod";

// Validation Zod d'un <form> + fusion avec les erreurs renvoyées par l'API.
// Ne connaît pas TanStack Query : le formulaire garde sa mutation.
export function useFormValidation<T>(
  schema: z.ZodType<T>,
  apiError?: ApiError | null,
) {
  const [zodErrors, setZodErrors] = useState<Partial<Record<string, string[]>>>(
    {},
  );
  // Erreurs Zod prioritaires : elles décrivent la saisie actuelle
  const fieldErrors = { ...apiError?.fieldErrors, ...zodErrors };

  // Données typées si la saisie est valide, null sinon (erreurs affichées)
  function parse(form: HTMLFormElement): T | null {
    const result = schema.safeParse(Object.fromEntries(new FormData(form)));
    if (!result.success) {
      setZodErrors(z.flattenError(result.error).fieldErrors);
      return null;
    }
    setZodErrors({});
    return result.data;
  }

  // FieldError attend [{ message }], l'API et Zod donnent ["…"] : on convertit
  const errorsFor = (name: string) =>
    fieldErrors[name]?.map((message) => ({ message }));

  return { parse, errorsFor };
}
