import type { Beer } from "@/entities/beer";
import { Button } from "@/shared/ui/button";
import type { DataTableFeatures } from "@/shared/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { createColumnHelper } from "@tanstack/react-table";
import { EllipsisVerticalIcon, Trash2Icon } from "lucide-react";

const euro = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});
const decimal = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

const columnHelper = createColumnHelper<DataTableFeatures, Beer>();

type BeerColumnActions = {
  onDelete: (beer: Beer) => void;
};

// Fonction plutôt que constante : la colonne d'actions a besoin des callbacks
// de la page (à appeler dans un useMemo, TanStack veut des colonnes stables).
// Les ids "price" et "alcoholLevel" sont aussi les valeurs de sortBy dans
// l'API : seules ces deux colonnes sont triables côté serveur
export const getBeerColumns = ({ onDelete }: BeerColumnActions) =>
  columnHelper.columns([
    columnHelper.accessor("name", {
      header: "Nom",
      enableSorting: false,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("breweryName", {
      header: "Brasserie",
      enableSorting: false,
    }),
    columnHelper.accessor("alcoholLevel", {
      header: "Degré",
      cell: (info) => `${decimal.format(info.getValue())} %`,
    }),
    columnHelper.accessor("price", {
      header: "Prix",
      cell: (info) => euro.format(info.getValue()),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions pour ${row.original.name}`}
              />
            }
          >
            <EllipsisVerticalIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(row.original)}
            >
              <Trash2Icon />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ]);
