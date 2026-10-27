import type { BeerListParams } from "@/entities/beer";
import { useListSearchParams } from "@/shared/lib/hooks/use-list-search-params";
import { z } from "zod";

// Chaque champ invalide (?breweryId=abc) est ignoré seul grâce à .catch,
// au lieu de casser la lecture ou de faire un 400
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

export const useBeerSearchParams = () =>
  useListSearchParams<BeerSearchParams>(searchParamsSchema);
