import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { z } from "zod";

type ListSearchParams = {
  page: number;
  sortBy?: string;
  order?: "asc" | "desc";
};

// Tout l'état d'une liste vit dans l'URL : F5, retour arrière, lien partagé.
// Le schéma décrit les paramètres de chaque page ; l'URL est une entrée
// utilisateur, il doit ignorer les valeurs invalides (.catch) plutôt qu'échouer
export function useListSearchParams<T extends ListSearchParams>(
  schema: z.ZodType<T>,
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = schema.parse(Object.fromEntries(searchParams));

  function setParams(patch: Partial<T>) {
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

  // URL (sortBy + order) ↔ état de tri de TanStack Table ([{ id, desc }]) :
  // les ids des colonnes triables sont les valeurs de sortBy de l'API
  const sorting: SortingState = params.sortBy
    ? [{ id: params.sortBy, desc: params.order === "desc" }]
    : [];

  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    const [sort] = typeof updater === "function" ? updater(sorting) : updater;
    setParams({
      sortBy: sort?.id,
      order: sort ? (sort.desc ? "desc" : "asc") : undefined,
    } as Partial<T>);
  };

  return { params, setParams, clearParams, sorting, onSortingChange };
}

// Listes recherchées et triées par nom (catégories, ingrédients, brasseries) :
// mêmes noms de paramètres que l'API
export const nameListSearchParamsSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  name: z.string().trim().max(100).optional().catch(undefined),
  sortBy: z.enum(["name"]).optional().catch(undefined),
  order: z.enum(["asc", "desc"]).optional().catch(undefined),
});

// Page au-delà de la dernière (dernier élément d'une page supprimé, ?page=99) :
// retour à la dernière page existante. Ignoré pendant un placeholder : son
// totalPages est celui de la requête précédente
export function useClampPage(
  page: number,
  totalPages: number | undefined,
  isPlaceholderData: boolean,
  onPageChange: (page: number) => void,
) {
  const lastPage = totalPages === undefined ? undefined : Math.max(totalPages, 1);
  useEffect(() => {
    if (lastPage && !isPlaceholderData && page > lastPage) onPageChange(lastPage);
  }, [lastPage, isPlaceholderData, page, onPageChange]);
}
