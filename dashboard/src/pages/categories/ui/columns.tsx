import type { Category } from "@/entities/category";
import type { DataTableFeatures } from "@/shared/ui/data-table";
import { RowActions } from "@/shared/ui/row-actions";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<DataTableFeatures, Category>();

type CategoryColumnActions = {
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
};

// L'id "name" est aussi la valeur de sortBy dans l'API : seule colonne triable
export const getCategoryColumns = ({
  onEdit,
  onDelete,
}: CategoryColumnActions) =>
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
          {info.getValue()}
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
