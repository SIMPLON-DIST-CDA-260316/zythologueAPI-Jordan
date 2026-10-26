import { apiFetch, type Paginated } from "@/shared/api";
import { queryOptions } from "@tanstack/react-query";
import type { Brewery } from "../model/types";

// shortcut: une seule page de 100 (max de l'API) suffit pour les 12 brasseries,
// passer à un combobox avec recherche côté API au-delà de 100
export const getAllBreweries = () =>
  apiFetch<Paginated<Brewery>>("/breweries", {
    query: { limit: 100, sortBy: "name" },
  });

export const breweryQueries = {
  all: ["breweries"] as const,
  options: () =>
    queryOptions({
      queryKey: [...breweryQueries.all, "options"],
      queryFn: getAllBreweries,
      select: (page) => page.data,
    }),
};
