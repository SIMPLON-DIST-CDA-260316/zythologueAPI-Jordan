import { apiFetch, type Paginated } from "@/shared/api";
import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { BeerLog, BeerLogListParams } from "../model/types";

export const getBeerLogs = (params: BeerLogListParams) =>
  apiFetch<Paginated<BeerLog>>("/beer-logs", { query: params });

export const beerLogQueries = {
  all: ["beer-logs"] as const,
  list: (params: BeerLogListParams) =>
    queryOptions({
      queryKey: [...beerLogQueries.all, "list", params],
      queryFn: () => getBeerLogs(params),
      placeholderData: keepPreviousData,
    }),
};
