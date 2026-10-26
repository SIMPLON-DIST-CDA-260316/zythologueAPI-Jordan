import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/shared/ui/button";

// Pilotée par props plutôt que par la rowPaginationFeature de TanStack Table :
// la table ne connaît que la page courante, c'est l'API qui pagine
type DataTablePaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  itemLabel: string; // pluriel, ex. "bières"
  onPageChange: (page: number) => void;
};

export function DataTablePagination({
  page,
  totalPages,
  total,
  itemLabel,
  onPageChange,
}: DataTablePaginationProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        {total} {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-sm">
          Page {page} sur {Math.max(totalPages, 1)}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Page précédente"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Page suivante"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}
