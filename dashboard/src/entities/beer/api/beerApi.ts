import { apiFetch, type Paginated } from "@/shared/api";
import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { Beer, BeerListParams } from "../model/types";

export const getBeers = (params: BeerListParams) =>
  apiFetch<Paginated<Beer>>("/beers", { query: params });

// Clé et fonction ensemble : useQuery(beerQueries.list(params)) ne peut pas
// se tromper de clé. Invalider beerQueries.all rafraîchit toutes les listes.
export const beerQueries = {
  all: ["beers"] as const,
  list: (params: BeerListParams) =>
    queryOptions({
      queryKey: [...beerQueries.all, "list", params],
      queryFn: () => getBeers(params),
      // La page affichée reste visible pendant le chargement de la suivante
      placeholderData: keepPreviousData,
    }),
};
