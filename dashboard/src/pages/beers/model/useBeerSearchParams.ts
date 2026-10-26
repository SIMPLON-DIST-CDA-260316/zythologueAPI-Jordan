import type { BeerListParams } from "@/entities/beer";
import { useSearchParams } from "react-router";
import { z } from "zod";

// L'URL est une entrée utilisateur : chaque champ invalide (?breweryId=abc)
// est ignoré seul grâce à .catch, au lieu de casser la lecture ou de faire un 400
const searchParamsSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  search: z.string().trim().max(100).optional().catch(undefined),
  breweryId: z.coerce.number().int().positive().optional().catch(undefined),
  isAlcoholFree: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional()
    .catch(undefined),
  sortBy: z.enum(["price", "alcoholLevel"]).optional().catch(undefined),
  order: z.enum(["asc", "desc"]).optional().catch(undefined),
});

export type BeerSearchParams = Omit<BeerListParams, "limit">;

export function useBeerSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params: BeerSearchParams = searchParamsSchema.parse(
    Object.fromEntries(searchParams),
  );

  function setParams(patch: Partial<BeerSearchParams>) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      // Nouvelle recherche, nouveau filtre ou nouveau tri : retour en page 1
      if (!("page" in patch)) next.delete("page");
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === "") next.delete(key);
        else next.set(key, String(value));
      }
      return next;
    });
  }

  const clearParams = () => setSearchParams({});

  return { params, setParams, clearParams };
}
