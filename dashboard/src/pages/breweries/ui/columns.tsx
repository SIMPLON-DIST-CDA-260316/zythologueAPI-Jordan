import type { Brewery } from "@/entities/brewery";
import type { DataTableFeatures } from "@/shared/ui/data-table";
import { RowActions } from "@/shared/ui/row-actions";
import { createColumnHelper } from "@tanstack/react-table";
import { Link } from "react-router";

const columnHelper = createColumnHelper<DataTableFeatures, Brewery>();

type BreweryColumnActions = {
  onEdit: (brewery: Brewery) => void;
  onDelete: (brewery: Brewery) => void;
};

// L'id "name" est aussi la valeur de sortBy dans l'API : seule colonne triable
export const getBreweryColumns = ({ onEdit, onDelete }: BreweryColumnActions) =>
  columnHelper.columns([
    columnHelper.accessor("name", {
      header: "Nom",
      cell: ({ row, getValue }) => (
        <Link
          to={`/brasseries/${row.original.id}`}
          className="font-medium underline-offset-4 hover:underline"
        >
          {getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor("city", { header: "Ville", enableSorting: false }),
    columnHelper.accessor("country", { header: "Pays", enableSorting: false }),
    columnHelper.accessor("beerCount", {
      header: "Bières",
      enableSorting: false,
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
