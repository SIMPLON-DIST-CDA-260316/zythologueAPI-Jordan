import { beerQueries, type Beer } from "@/entities/beer";
import { BeerFormSheet } from "@/features/beer-form";
import { DeleteBeerDialog } from "@/features/delete-beer";
import { Button } from "@/shared/ui/button";
import { DataTable } from "@/shared/ui/data-table";
import { DataTablePagination } from "@/shared/ui/data-table-pagination";
import { SiteHeader } from "@/widgets/site-header";
import { useQuery } from "@tanstack/react-query";
import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { cn } from "cn";
import { PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useBeerSearchParams } from "../model/useBeerSearchParams";
import { BeersToolbar } from "./BeersToolbar";
import { getBeerColumns } from "./columns";

const PAGE_SIZE = 10;

export function BeersPage() {
  // Tout l'état de la liste vit dans l'URL : F5, retour arrière, lien partagé
  const { params, setParams, clearParams } = useBeerSearchParams();
  const [beerToDelete, setBeerToDelete] = useState<Beer | null>(null);
  // open séparé de beer : à la fermeture, le titre reste le bon pendant l'animation
  const [form, setForm] = useState<{ open: boolean; beer: Beer | null }>({
    open: false,
    beer: null,
  });
  const columns = useMemo(
    () =>
      getBeerColumns({
        onEdit: (beer) => setForm({ open: true, beer }),
        onDelete: setBeerToDelete,
      }),
    [],
  );

  const { data, isPending, isError, error, isPlaceholderData } = useQuery(
    beerQueries.list({ ...params, limit: PAGE_SIZE }),
  );

  // Page au-delà de la dernière (dernière bière d'une page supprimée,
  // ?page=99) : retour à la dernière page existante
  const lastPage = data ? Math.max(data.totalPages, 1) : undefined;
  useEffect(() => {
    if (lastPage && !isPlaceholderData && params.page > lastPage) {
      setParams({ page: lastPage });
    }
  }, [lastPage, isPlaceholderData, params.page, setParams]);

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
        <div className="flex flex-wrap items-start justify-between gap-2">
          <BeersToolbar
            params={params}
            setParams={setParams}
            clearParams={clearParams}
          />
          <Button onClick={() => setForm({ open: true, beer: null })}>
            <PlusIcon />
            Ajouter une bière
          </Button>
        </div>
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
      <BeerFormSheet
        open={form.open}
        beer={form.beer}
        onOpenChange={(open) => setForm((current) => ({ ...current, open }))}
      />
      <DeleteBeerDialog
        beer={beerToDelete}
        onClose={() => setBeerToDelete(null)}
      />
    </>
  );
}
