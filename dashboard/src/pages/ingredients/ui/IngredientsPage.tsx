import {
  ingredientQueries,
  type Ingredient,
  type IngredientListParams,
} from "@/entities/ingredient";
import { IngredientFormSheet } from "@/features/ingredient-form";
import { DeleteIngredientDialog } from "@/features/delete-ingredient";
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
import { getIngredientColumns } from "./columns";

const PAGE_SIZE = 10;

// Même structure que BeersPage, sans filtre : seulement recherche et tri par nom
export function IngredientsPage() {
  const { params, setParams, clearParams, sorting, onSortingChange } =
    useListSearchParams<Omit<IngredientListParams, "limit">>(
      nameListSearchParamsSchema,
    );
  const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(
    null,
  );
  // open séparé de ingredient : à la fermeture, le titre reste le bon pendant l'animation
  const [form, setForm] = useState<{
    open: boolean;
    ingredient: Ingredient | null;
  }>({ open: false, ingredient: null });
  const columns = useMemo(
    () =>
      getIngredientColumns({
        onEdit: (ingredient) => setForm({ open: true, ingredient }),
        onDelete: setIngredientToDelete,
      }),
    [],
  );

  const { data, isPending, isError, error, isPlaceholderData } = useQuery(
    ingredientQueries.list({ ...params, limit: PAGE_SIZE }),
  );

  useClampPage(params.page, data?.totalPages, isPlaceholderData, (page) =>
    setParams({ page }),
  );

  return (
    <>
      <SiteHeader title="Ingrédients" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              value={params.name}
              onSearch={(name) => setParams({ name })}
              placeholder="Rechercher un ingrédient…"
              label="Rechercher un ingrédient par son nom"
            />
            {(params.name || params.sortBy) && (
              <Button variant="ghost" onClick={clearParams}>
                <XIcon />
                Réinitialiser
              </Button>
            )}
          </div>
          <Button onClick={() => setForm({ open: true, ingredient: null })}>
            <PlusIcon />
            Ajouter un ingrédient
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
              emptyMessage="Aucun ingrédient"
              sorting={sorting}
              onSortingChange={onSortingChange}
              className={cn(isPlaceholderData && "opacity-60")}
            />
            {data && (
              <DataTablePagination
                page={params.page}
                totalPages={data.totalPages}
                total={data.total}
                itemLabel="ingrédients"
                onPageChange={(page) => setParams({ page })}
              />
            )}
          </>
        )}
      </div>
      <IngredientFormSheet
        open={form.open}
        ingredient={form.ingredient}
        onOpenChange={(open) => setForm((current) => ({ ...current, open }))}
      />
      <DeleteIngredientDialog
        ingredient={ingredientToDelete}
        onClose={() => setIngredientToDelete(null)}
      />
    </>
  );
}
