import {
  categoryQueries,
  type Category,
  type CategoryListParams,
} from "@/entities/category";
import { CategoryFormSheet } from "@/features/category-form";
import { DeleteCategoryDialog } from "@/features/delete-category";
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
import { getCategoryColumns } from "./columns";

const PAGE_SIZE = 10;

// Même structure que BeersPage, sans filtre : seulement recherche et tri par nom
export function CategoriesPage() {
  const { params, setParams, clearParams, sorting, onSortingChange } =
    useListSearchParams<Omit<CategoryListParams, "limit">>(
      nameListSearchParamsSchema,
    );
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );
  // open séparé de category : à la fermeture, le titre reste le bon pendant l'animation
  const [form, setForm] = useState<{
    open: boolean;
    category: Category | null;
  }>({ open: false, category: null });
  const columns = useMemo(
    () =>
      getCategoryColumns({
        onEdit: (category) => setForm({ open: true, category }),
        onDelete: setCategoryToDelete,
      }),
    [],
  );

  const { data, isPending, isError, error, isPlaceholderData } = useQuery(
    categoryQueries.list({ ...params, limit: PAGE_SIZE }),
  );

  useClampPage(params.page, data?.totalPages, isPlaceholderData, (page) =>
    setParams({ page }),
  );

  return (
    <>
      <SiteHeader title="Catégories" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              value={params.name}
              onSearch={(name) => setParams({ name })}
              placeholder="Rechercher une catégorie…"
              label="Rechercher une catégorie par son nom"
            />
            {(params.name || params.sortBy) && (
              <Button variant="ghost" onClick={clearParams}>
                <XIcon />
                Réinitialiser
              </Button>
            )}
          </div>
          <Button onClick={() => setForm({ open: true, category: null })}>
            <PlusIcon />
            Ajouter une catégorie
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
              emptyMessage="Aucune catégorie"
              sorting={sorting}
              onSortingChange={onSortingChange}
              className={cn(isPlaceholderData && "opacity-60")}
            />
            {data && (
              <DataTablePagination
                page={params.page}
                totalPages={data.totalPages}
                total={data.total}
                itemLabel="catégories"
                onPageChange={(page) => setParams({ page })}
              />
            )}
          </>
        )}
      </div>
      <CategoryFormSheet
        open={form.open}
        category={form.category}
        onOpenChange={(open) => setForm((current) => ({ ...current, open }))}
      />
      <DeleteCategoryDialog
        category={categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
      />
    </>
  );
}
