import {
  ingredientQueries,
  createIngredient,
  updateIngredient,
  type Ingredient,
} from "@/entities/ingredient";
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
import type { CreateIngredientInput } from "@zythologue/shared";
import { toast } from "sonner";
import { ingredientFormSchema } from "../model/schema";

type IngredientFormSheetProps = {
  open: boolean;
  ingredient: Ingredient | null; // null = création, sinon édition (pré-rempli)
  onOpenChange: (open: boolean) => void;
};

// Même principe que BeerFormSheet : un composant pour créer et modifier,
// contenu démonté à la fermeture
export function IngredientFormSheet({
  open,
  ingredient,
  onOpenChange,
}: IngredientFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {ingredient
              ? `Modifier « ${ingredient.name} »`
              : "Ajouter un ingrédient"}
          </SheetTitle>
        </SheetHeader>
        <IngredientForm
          key={ingredient?.id ?? "new"}
          ingredient={ingredient}
          onSuccess={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

function IngredientForm({
  ingredient,
  onSuccess,
}: {
  ingredient: Ingredient | null;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: (input: CreateIngredientInput) =>
      ingredient ? updateIngredient(ingredient.id, input) : createIngredient(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ingredientQueries.all });
      toast.success(ingredient ? "Ingrédient modifié" : "Ingrédient ajouté");
      onSuccess();
    },
  });
  const { parse, errorsFor } = useFormValidation(ingredientFormSchema, error);

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
          defaultValue={ingredient?.name}
          maxLength={255}
          required
          errors={errorsFor("name")}
        />
        <Field>
          <FieldLabel htmlFor="description">
            Description (facultatif)
          </FieldLabel>
          <Textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={ingredient?.description ?? ""}
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
            : ingredient
              ? "Enregistrer les modifications"
              : "Ajouter l'ingrédient"}
        </Button>
      </SheetFooter>
    </form>
  );
}
