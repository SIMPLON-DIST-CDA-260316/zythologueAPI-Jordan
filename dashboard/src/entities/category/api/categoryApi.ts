import { apiFetch, type Paginated } from "@/shared/api";
import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { CreateCategoryInput } from "@zythologue/shared";
import type { Category, CategoryListParams } from "../model/types";

export const getCategories = (params: CategoryListParams) =>
  apiFetch<Paginated<Category>>("/categories", { query: params });

export const createCategory = (input: CreateCategoryInput) =>
  apiFetch<Category>("/categories", { method: "POST", body: input });

// Le formulaire envoie tous les champs : PATCH les accepte tous en optionnels
export const updateCategory = (id: number, input: CreateCategoryInput) =>
  apiFetch<Category>(`/categories/${id}`, { method: "PATCH", body: input });

export const deleteCategory = (id: number) =>
  apiFetch<void>(`/categories/${id}`, { method: "DELETE" });

export const categoryQueries = {
  all: ["categories"] as const,
  list: (params: CategoryListParams) =>
    queryOptions({
      queryKey: [...categoryQueries.all, "list", params],
      queryFn: () => getCategories(params),
      placeholderData: keepPreviousData,
    }),
};
