import type { Ingredient } from "@/entities/ingredient";
import type { DataTableFeatures } from "@/shared/ui/data-table";
import { RowActions } from "@/shared/ui/row-actions";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<DataTableFeatures, Ingredient>();

type IngredientColumnActions = {
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
};

// L'id "name" est aussi la valeur de sortBy dans l'API : seule colonne triable
export const getIngredientColumns = ({
  onEdit,
  onDelete,
}: IngredientColumnActions) =>
  columnHelper.columns([
    columnHelper.accessor("name", {
      header: "Nom",
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("description", {
      header: "Description",
      enableSorting: false,
      cell: (info) => (
        <span className="line-clamp-2 whitespace-normal text-muted-foreground">
          {info.getValue() ?? "—"}
        </span>
      ),
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
