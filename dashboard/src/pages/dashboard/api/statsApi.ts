import { apiFetch } from "@/shared/api";
import { queryOptions } from "@tanstack/react-query";
import type { Stats } from "../model/types";

// Dans le slice de la page et non dans entities : seul l'accueil s'en sert
export const getStats = () => apiFetch<Stats>("/stats");

export const statsQueries = {
  all: ["stats"] as const,
  overview: () =>
    queryOptions({
      queryKey: [...statsQueries.all, "overview"],
      queryFn: getStats,
    }),
};
