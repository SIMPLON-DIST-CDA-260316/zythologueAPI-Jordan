import {
  categoryQueries,
  createCategory,
  updateCategory,
  type Category,
} from "@/entities/category";
import { useFormValidation } from "@/shared/lib/hooks/use-form-validation";
import { Button } from "@/shared/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { FormField } from "@/shared/ui/form-field";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Textarea } from "@/shared/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCategorySchema,
  type CreateCategoryInput,
} from "@zythologue/shared";
import { toast } from "sonner";

type CategoryFormSheetProps = {
  open: boolean;
  category: Category | null; // null = création, sinon édition (pré-rempli)
  onOpenChange: (open: boolean) => void;
};

// Même principe que BeerFormSheet : un composant pour créer et modifier,
// contenu démonté à la fermeture
export function CategoryFormSheet({
  open,
  category,
  onOpenChange,
}: CategoryFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {category
              ? `Modifier « ${category.name} »`
              : "Ajouter une catégorie"}
          </SheetTitle>
        </SheetHeader>
        <CategoryForm
          key={category?.id ?? "new"}
          category={category}
          onSuccess={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

function CategoryForm({
  category,
  onSuccess,
}: {
  category: Category | null;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      category ? updateCategory(category.id, input) : createCategory(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoryQueries.all });
      toast.success(category ? "Catégorie modifiée" : "Catégorie ajoutée");
      onSuccess();
    },
  });
  // Les deux champs sont des textes : le schéma partagé valide le FormData tel quel
  const { parse, errorsFor } = useFormValidation(createCategorySchema, error);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    reset(); // efface l'erreur API de la tentative précédente
    const data = parse(event.currentTarget);
    if (data) mutate(data);
  }

  const descriptionErrors = errorsFor("description");

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col">
      <FieldGroup className="px-4">
        <FormField
          name="name"
          label="Nom"
          defaultValue={category?.name}
          maxLength={255}
          required
          errors={errorsFor("name")}
        />
        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={category?.description}
            required
            aria-invalid={!!descriptionErrors}
          />
          <FieldError errors={descriptionErrors} />
        </Field>
      </FieldGroup>
      <SheetFooter>
        {error && <FieldError>{error.message}</FieldError>}
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Enregistrement…"
            : category
              ? "Enregistrer les modifications"
              : "Ajouter la catégorie"}
        </Button>
      </SheetFooter>
    </form>
  );
}
