import { beerQueries } from "@/entities/beer";
import {
  breweryQueries,
  deleteBrewery,
  type Brewery,
} from "@/entities/brewery";
import { ConfirmDeleteDialog } from "@/shared/ui/confirm-delete-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type DeleteBreweryDialogProps = {
  brewery: Brewery | null; // null = fermé
  onClose: () => void;
};

export function DeleteBreweryDialog({
  brewery,
  onClose,
}: DeleteBreweryDialogProps) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: deleteBrewery,
    onSuccess: async () => {
      // Cascade SQL : ses bières disparaissent aussi des listes de bières
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: breweryQueries.all }),
        queryClient.invalidateQueries({ queryKey: beerQueries.all }),
      ]);
      toast.success("Brasserie supprimée");
      onClose();
    },
    onError: (error) => {
      // 401 déjà signalé par le toast global « Session expirée » (App.tsx)
      if (error.status !== 401) toast.error(error.message);
    },
  });

  const beerCount = brewery?.beerCount ?? 0;

  return (
    <ConfirmDeleteDialog
      open={brewery !== null}
      title={`Supprimer « ${brewery?.name} » ?`}
      description={
        beerCount > 0 ? (
          <>
            <strong>
              {beerCount === 1
                ? "Sa bière sera aussi supprimée"
                : `Ses ${beerCount} bières seront aussi supprimées`}
            </strong>
            , avec leurs photos et leurs avis, ainsi que les photos de la
            brasserie.
          </>
        ) : (
          "Ses photos seront aussi supprimées."
        )
      }
      isPending={isPending}
      onConfirm={() => brewery && mutate(brewery.id)}
      onClose={onClose}
    />
  );
}
