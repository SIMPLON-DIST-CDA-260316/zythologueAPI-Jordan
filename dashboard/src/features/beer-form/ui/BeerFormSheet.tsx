import {
  beerQueries,
  createBeer,
  updateBeer,
  type Beer,
} from "@/entities/beer";
import { breweryQueries } from "@/entities/brewery";
import { useAuth } from "@/entities/session";
import { useFormValidation } from "@/shared/lib/hooks/use-form-validation";
import { Button } from "@/shared/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { FormField } from "@/shared/ui/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { Textarea } from "@/shared/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateBeerInput } from "@zythologue/shared";
import { toast } from "sonner";
import { beerFormSchema } from "../model/schema";

type BeerFormSheetProps = {
  open: boolean;
  beer: Beer | null; // null = création, sinon édition (pré-rempli)
  onOpenChange: (open: boolean) => void;
};

// Un seul composant pour créer et modifier. Le contenu du Sheet est démonté
// à la fermeture : saisie et erreurs repartent de zéro à chaque ouverture.
export function BeerFormSheet({
  open,
  beer,
  onOpenChange,
}: BeerFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {beer ? `Modifier « ${beer.name} »` : "Ajouter une bière"}
          </SheetTitle>
          <SheetDescription>
            Une bière sous 0,5 % est enregistrée comme sans alcool.
          </SheetDescription>
        </SheetHeader>
        <BeerForm
          key={beer?.id ?? "new"}
          beer={beer}
          onSuccess={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

function BeerForm({
  beer,
  onSuccess,
}: {
  beer: Beer | null;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const { data: breweries = [] } = useQuery({
    ...breweryQueries.options(),
    enabled: isAdmin,
  });
  const breweryItems = breweries.map((b) => ({
    value: String(b.id),
    label: b.name,
  }));

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: (input: CreateBeerInput) =>
      beer ? updateBeer(beer.id, input) : createBeer(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: beerQueries.all });
      toast.success(beer ? "Bière modifiée" : "Bière ajoutée");
      onSuccess();
    },
  });
  const { parse, errorsFor } = useFormValidation(beerFormSchema, error);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    reset(); // efface l'erreur API de la tentative précédente
    const data = parse(event.currentTarget);
    if (data) mutate(data);
  }

  const descriptionErrors = errorsFor("description");
  const breweryErrors = errorsFor("breweryId");

  return (
    // noValidate : Zod affiche les erreurs, les attributs HTML restent pour
    // le clavier mobile (pavé numérique) et l'accessibilité
    <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col">
      <FieldGroup className="px-4">
        <FormField
          name="name"
          label="Nom"
          defaultValue={beer?.name}
          maxLength={255}
          required
          errors={errorsFor("name")}
        />
        <Field>
          <FieldLabel htmlFor="breweryId">Brasserie</FieldLabel>
          <Select
            name="breweryId"
            items={breweryItems}
            defaultValue={beer ? String(beer.breweryId) : null}
          >
            <SelectTrigger
              id="breweryId"
              className="w-full"
              aria-invalid={!!breweryErrors}
            >
              <SelectValue placeholder="Choisir une brasserie" />
            </SelectTrigger>
            <SelectContent>
              {breweryItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={breweryErrors} />
        </Field>
        <Field className="grid grid-cols-2 gap-4">
          <FormField
            name="alcoholLevel"
            label="Degré (%)"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            max="100"
            defaultValue={beer?.alcoholLevel}
            required
            errors={errorsFor("alcoholLevel")}
          />
          <FormField
            name="price"
            label="Prix (€)"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            max="9999.99"
            defaultValue={beer?.price}
            required
            errors={errorsFor("price")}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="description">
            Description (facultatif)
          </FieldLabel>
          <Textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={beer?.description ?? ""}
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
            : beer
              ? "Enregistrer les modifications"
              : "Ajouter la bière"}
        </Button>
      </SheetFooter>
    </form>
  );
}
