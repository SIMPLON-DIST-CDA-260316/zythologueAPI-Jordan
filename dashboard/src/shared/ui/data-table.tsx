import {
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type OnChangeFn,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import { cn } from "cn";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";

import { Skeleton } from "@/shared/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

// Pagination, tri et recherche sont faits par l'API. Seul l'état du tri est
// géré par la table (manualSorting) : pas de row model de tri côté client
const features = tableFeatures({ rowSortingFeature });
export type DataTableFeatures = typeof features;

const SKELETON_ROWS = 5;

const ariaSort = { asc: "ascending", desc: "descending" } as const;
const sortIcons = { asc: ArrowUpIcon, desc: ArrowDownIcon };

type DataTableProps<TData extends RowData> = {
  columns: ColumnDef<DataTableFeatures, TData>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  // Sans ces deux props, la table n'est pas triable
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
};

export function DataTable<TData extends RowData>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "Aucun résultat",
  className,
  sorting = [],
  onSortingChange,
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    data,
    columns,
    manualSorting: true,
    enableSorting: !!onSortingChange,
    // Cycle prévisible pour toutes les colonnes : croissant → décroissant → aucun
    // (par défaut, TanStack commence par décroissant sur les nombres)
    sortDescFirst: false,
    state: { sorting },
    onSortingChange,
  });
  const rows = table.getRowModel().rows;

  return (
    <div className={cn("overflow-hidden rounded-md border", className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                const SortIcon = sorted ? sortIcons[sorted] : ArrowUpDownIcon;
                return (
                  <TableHead
                    key={header.id}
                    aria-sort={
                      canSort ? (sorted ? ariaSort[sorted] : "none") : undefined
                    }
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        className="-ml-2 inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-muted"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <table.FlexRender header={header} />
                        <SortIcon className="size-3.5 text-muted-foreground" />
                      </button>
                    ) : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }, (_, i) => (
              <TableRow key={i}>
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
