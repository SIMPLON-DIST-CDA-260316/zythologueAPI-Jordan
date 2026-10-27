import { apiFetch, type Paginated } from "@/shared/api";
import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { CreateBreweryInput } from "@zythologue/shared";
import type { Brewery, BreweryListParams } from "../model/types";

export const getBreweries = (params: BreweryListParams) =>
  apiFetch<Paginated<Brewery>>("/breweries", { query: params });

// shortcut: une seule page de 100 (max de l'API) suffit pour les 12 brasseries,
// passer à un combobox avec recherche côté API au-delà de 100
export const getAllBreweries = () =>
  getBreweries({ page: 1, limit: 100, sortBy: "name" });

export const createBrewery = (input: CreateBreweryInput) =>
  apiFetch<Brewery>("/breweries", { method: "POST", body: input });

// Le formulaire envoie tous les champs : PATCH les accepte tous en optionnels
export const updateBrewery = (id: number, input: CreateBreweryInput) =>
  apiFetch<Brewery>(`/breweries/${id}`, { method: "PATCH", body: input });

export const deleteBrewery = (id: number) =>
  apiFetch<void>(`/breweries/${id}`, { method: "DELETE" });

// Invalider breweryQueries.all rafraîchit la liste ET les options des selects
export const breweryQueries = {
  all: ["breweries"] as const,
  list: (params: BreweryListParams) =>
    queryOptions({
      queryKey: [...breweryQueries.all, "list", params],
      queryFn: () => getBreweries(params),
      placeholderData: keepPreviousData,
    }),
  options: () =>
    queryOptions({
      queryKey: [...breweryQueries.all, "options"],
      queryFn: getAllBreweries,
      select: (page) => page.data,
    }),
};
