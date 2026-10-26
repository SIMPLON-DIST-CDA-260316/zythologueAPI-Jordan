import { beerQueries } from "@/entities/beer";
import { DataTable } from "@/shared/ui/data-table";
import { DataTablePagination } from "@/shared/ui/data-table-pagination";
import { SiteHeader } from "@/widgets/site-header";
import { useQuery } from "@tanstack/react-query";
import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { cn } from "cn";
import { useBeerSearchParams } from "../model/useBeerSearchParams";
import { BeersToolbar } from "./BeersToolbar";
import { columns } from "./columns";

const PAGE_SIZE = 10;

export function BeersPage() {
  // Tout l'état de la liste vit dans l'URL : F5, retour arrière, lien partagé
  const { params, setParams, clearParams } = useBeerSearchParams();

  const { data, isPending, isError, error, isPlaceholderData } = useQuery(
    beerQueries.list({ ...params, limit: PAGE_SIZE }),
  );

  // URL (sortBy + order) ↔ état de tri de TanStack Table ([{ id, desc }])
  const sorting: SortingState = params.sortBy
    ? [{ id: params.sortBy, desc: params.order === "desc" }]
    : [];

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const [sort] = typeof updater === "function" ? updater(sorting) : updater;
    setParams({
      sortBy: sort?.id as "price" | "alcoholLevel" | undefined,
      order: sort ? (sort.desc ? "desc" : "asc") : undefined,
    });
  };

  return (
    <>
      <SiteHeader title="Bières" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <BeersToolbar
          params={params}
          setParams={setParams}
          clearParams={clearParams}
        />
        {isError ? (
          <p className="text-sm text-destructive">{error.message}</p>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data?.data ?? []}
              isLoading={isPending}
              emptyMessage="Aucune bière"
              sorting={sorting}
              onSortingChange={handleSortingChange}
              // Données de la page précédente affichées pendant le chargement
              className={cn(isPlaceholderData && "opacity-60")}
            />
            {data && (
              <DataTablePagination
                page={params.page}
                totalPages={data.totalPages}
                total={data.total}
                itemLabel="bières"
                onPageChange={(page) => setParams({ page })}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
