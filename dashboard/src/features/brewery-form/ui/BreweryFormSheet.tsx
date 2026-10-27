import { beerQueries } from "@/entities/beer";
import {
  breweryQueries,
  createBrewery,
  updateBrewery,
  type Brewery,
} from "@/entities/brewery";
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
import type { CreateBreweryInput } from "@zythologue/shared";
import { toast } from "sonner";
import { breweryFormSchema } from "../model/schema";

type BreweryFormSheetProps = {
  open: boolean;
  brewery: Brewery | null; // null = création, sinon édition (pré-rempli)
  onOpenChange: (open: boolean) => void;
};

// Même principe que BeerFormSheet : un composant pour créer et modifier,
// contenu démonté à la fermeture
export function BreweryFormSheet({
  open,
  brewery,
  onOpenChange,
}: BreweryFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {brewery ? `Modifier « ${brewery.name} »` : "Ajouter une brasserie"}
          </SheetTitle>
        </SheetHeader>
        <BreweryForm
          key={brewery?.id ?? "new"}
          brewery={brewery}
          onSuccess={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

function BreweryForm({
  brewery,
  onSuccess,
}: {
  brewery: Brewery | null;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: (input: CreateBreweryInput) =>
      brewery ? updateBrewery(brewery.id, input) : createBrewery(input),
    onSuccess: async () => {
      // La liste des bières affiche le nom de la brasserie : elle aussi est périmée
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: breweryQueries.all }),
        queryClient.invalidateQueries({ queryKey: beerQueries.all }),
      ]);
      toast.success(brewery ? "Brasserie modifiée" : "Brasserie ajoutée");
      onSuccess();
    },
  });
  const { parse, errorsFor } = useFormValidation(breweryFormSchema, error);

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
          defaultValue={brewery?.name}
          maxLength={255}
          required
          errors={errorsFor("name")}
        />
        <Field className="grid grid-cols-2 gap-4">
          <FormField
            name="city"
            label="Ville"
            defaultValue={brewery?.city}
            maxLength={100}
            required
            errors={errorsFor("city")}
          />
          <FormField
            name="country"
            label="Pays"
            defaultValue={brewery?.country}
            maxLength={100}
            required
            errors={errorsFor("country")}
          />
        </Field>
        <FormField
          name="website"
          label="Site web (facultatif)"
          type="url"
          inputMode="url"
          placeholder="https://…"
          defaultValue={brewery?.website ?? ""}
          maxLength={2048}
          errors={errorsFor("website")}
        />
        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={brewery?.description}
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
            : brewery
              ? "Enregistrer les modifications"
              : "Ajouter la brasserie"}
        </Button>
      </SheetFooter>
    </form>
  );
}
