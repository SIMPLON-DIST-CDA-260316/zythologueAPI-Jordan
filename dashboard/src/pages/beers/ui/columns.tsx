import type { Beer } from "@/entities/beer";
import { formatAlcoholLevel, formatPrice } from "@/shared/lib/format";
import type { DataTableFeatures } from "@/shared/ui/data-table";
import { RowActions } from "@/shared/ui/row-actions";
import { createColumnHelper } from "@tanstack/react-table";
import { Link } from "react-router";

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
      cell: ({ row, getValue }) => (
        <Link
          to={`/bieres/${row.original.id}`}
          className="font-medium underline-offset-4 hover:underline"
        >
          {getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor("breweryName", {
      header: "Brasserie",
      enableSorting: false,
      cell: ({ row, getValue }) => (
        <Link
          to={`/brasseries/${row.original.breweryId}`}
          className="underline-offset-4 hover:underline"
        >
          {getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor("alcoholLevel", {
      header: "Degré",
      cell: (info) => formatAlcoholLevel(info.getValue()),
    }),
    columnHelper.accessor("price", {
      header: "Prix",
      cell: (info) => formatPrice(info.getValue()),
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
