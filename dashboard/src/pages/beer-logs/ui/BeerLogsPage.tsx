import { beerLogQueries, type BeerLog } from "@/entities/beer-log";
import {
  useClampPage,
  useListSearchParams,
} from "@/shared/lib/hooks/use-list-search-params";
import { DataTable, type DataTableFeatures } from "@/shared/ui/data-table";
import { DataTablePagination } from "@/shared/ui/data-table-pagination";
import { SiteHeader } from "@/widgets/site-header";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { cn } from "cn";
import { z } from "zod";

const PAGE_SIZE = 10;

const searchParamsSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
});

const dateTime = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

const columnHelper = createColumnHelper<DataTableFeatures, BeerLog>();

// Pas d'actions : le journal est en lecture seule, donc des colonnes constantes
const columns = columnHelper.columns([
  columnHelper.accessor("loggedAt", {
    header: "Date",
    cell: (info) => dateTime.format(new Date(info.getValue())),
  }),
  columnHelper.accessor("beerName", {
    header: "Bière",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor("action", {
    header: "Action",
    cell: () => "Ajout",
  }),
]);

// Une bière supprimée emporte ses entrées (ON DELETE CASCADE) : le journal ne
// liste donc que les ajouts des bières encore au catalogue
export function BeerLogsPage() {
  const { params, setParams } = useListSearchParams(searchParamsSchema);
  const { data, isPending, isError, error, isPlaceholderData } = useQuery(
    beerLogQueries.list({ ...params, limit: PAGE_SIZE }),
  );

  useClampPage(params.page, data?.totalPages, isPlaceholderData, (page) =>
    setParams({ page }),
  );

  return (
    <>
      <SiteHeader title="Journal" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        {isError ? (
          <p className="text-sm text-destructive">{error.message}</p>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={data?.data ?? []}
              isLoading={isPending}
              emptyMessage="Aucune entrée"
              className={cn(isPlaceholderData && "opacity-60")}
            />
            {data && (
              <DataTablePagination
                page={params.page}
                totalPages={data.totalPages}
                total={data.total}
                itemLabel="entrées"
                onPageChange={(page) => setParams({ page })}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
