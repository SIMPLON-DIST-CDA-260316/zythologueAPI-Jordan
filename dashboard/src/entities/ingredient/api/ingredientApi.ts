import { apiFetch, type Paginated } from "@/shared/api";
import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { CreateIngredientInput } from "@zythologue/shared";
import type { Ingredient, IngredientListParams } from "../model/types";

export const getIngredients = (params: IngredientListParams) =>
  apiFetch<Paginated<Ingredient>>("/ingredients", { query: params });

export const createIngredient = (input: CreateIngredientInput) =>
  apiFetch<Ingredient>("/ingredients", { method: "POST", body: input });

// Le formulaire envoie tous les champs : PATCH les accepte tous en optionnels
export const updateIngredient = (id: number, input: CreateIngredientInput) =>
  apiFetch<Ingredient>(`/ingredients/${id}`, { method: "PATCH", body: input });

export const deleteIngredient = (id: number) =>
  apiFetch<void>(`/ingredients/${id}`, { method: "DELETE" });

export const ingredientQueries = {
  all: ["ingredients"] as const,
  list: (params: IngredientListParams) =>
    queryOptions({
      queryKey: [...ingredientQueries.all, "list", params],
      queryFn: () => getIngredients(params),
      placeholderData: keepPreviousData,
    }),
};
