import type { Beer } from "@/entities/beer";
import type { DataTableFeatures } from "@/shared/ui/data-table";
import { RowActions } from "@/shared/ui/row-actions";
import { createColumnHelper } from "@tanstack/react-table";

const euro = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});
const decimal = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

const columnHelper = createColumnHelper<DataTableFeatures, Beer>();

type BeerColumnActions = {
  onEdit: (beer: Beer) => void;
  onDelete: (beer: Beer) => void;
};

// Fonction plutôt que constante : la colonne d'actions a besoin des callbacks
// de la page (à appeler dans un useMemo, TanStack veut des colonnes stables).
// Les ids "price" et "alcoholLevel" sont aussi les valeurs de sortBy dans
// l'API : seules ces deux colonnes sont triables côté serveur
export const getBeerColumns = ({ onEdit, onDelete }: BeerColumnActions) =>
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
        <RowActions
          label={row.original.name}
          onEdit={() => onEdit(row.original)}
          onDelete={() => onDelete(row.original)}
        />
      ),
    }),
  ]);
