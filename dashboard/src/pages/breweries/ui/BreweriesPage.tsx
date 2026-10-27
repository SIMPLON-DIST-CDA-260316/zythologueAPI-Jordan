import {
  breweryQueries,
  type Brewery,
  type BreweryListParams,
} from "@/entities/brewery";
import { BreweryFormSheet } from "@/features/brewery-form";
import { DeleteBreweryDialog } from "@/features/delete-brewery";
import {
  nameListSearchParamsSchema,
  useClampPage,
  useListSearchParams,
} from "@/shared/lib/hooks/use-list-search-params";
import { Button } from "@/shared/ui/button";
import { DataTable } from "@/shared/ui/data-table";
import { DataTablePagination } from "@/shared/ui/data-table-pagination";
import { SearchInput } from "@/shared/ui/search-input";
import { SiteHeader } from "@/widgets/site-header";
import { useQuery } from "@tanstack/react-query";
import { cn } from "cn";
import { PlusIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { getBreweryColumns } from "./columns";

const PAGE_SIZE = 10;

// Même structure que BeersPage, sans filtre : seulement recherche et tri par nom
export function BreweriesPage() {
  const { params, setParams, clearParams, sorting, onSortingChange } =
    useListSearchParams<Omit<BreweryListParams, "limit">>(
      nameListSearchParamsSchema,
    );
  const [breweryToDelete, setBreweryToDelete] = useState<Brewery | null>(
    null,
  );
  // open séparé de brewery : à la fermeture, le titre reste le bon pendant l'animation
  const [form, setForm] = useState<{
    open: boolean;
    brewery: Brewery | null;
  }>({ open: false, brewery: null });
  const columns = useMemo(
    () =>
      getBreweryColumns({
        onEdit: (brewery) => setForm({ open: true, brewery }),
        onDelete: setBreweryToDelete,
      }),
    [],
  );

  const { data, isPending, isError, error, isPlaceholderData } = useQuery(
    breweryQueries.list({ ...params, limit: PAGE_SIZE }),
  );

  useClampPage(params.page, data?.totalPages, isPlaceholderData, (page) =>
    setParams({ page }),
  );

  return (
    <>
      <SiteHeader title="Brasseries" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              value={params.name}
              onSearch={(name) => setParams({ name })}
              placeholder="Rechercher une brasserie…"
              label="Rechercher une brasserie par son nom"
            />
            {(params.name || params.sortBy) && (
              <Button variant="ghost" onClick={clearParams}>
                <XIcon />
                Réinitialiser
              </Button>
            )}
          </div>
          <Button onClick={() => setForm({ open: true, brewery: null })}>
            <PlusIcon />
            Ajouter une brasserie
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
              emptyMessage="Aucune brasserie"
              sorting={sorting}
              onSortingChange={onSortingChange}
              className={cn(isPlaceholderData && "opacity-60")}
            />
            {data && (
              <DataTablePagination
                page={params.page}
                totalPages={data.totalPages}
                total={data.total}
                itemLabel="brasseries"
                onPageChange={(page) => setParams({ page })}
              />
            )}
          </>
        )}
      </div>
      <BreweryFormSheet
        open={form.open}
        brewery={form.brewery}
        onOpenChange={(open) => setForm((current) => ({ ...current, open }))}
      />
      <DeleteBreweryDialog
        brewery={breweryToDelete}
        onClose={() => setBreweryToDelete(null)}
      />
    </>
  );
}
