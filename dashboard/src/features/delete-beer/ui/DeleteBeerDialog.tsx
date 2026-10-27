import { beerQueries, deleteBeer, type Beer } from "@/entities/beer";
import { ConfirmDeleteDialog } from "@/shared/ui/confirm-delete-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type DeleteBeerDialogProps = {
  beer: Beer | null; // null = fermé
  onClose: () => void;
};

export function DeleteBeerDialog({ beer, onClose }: DeleteBeerDialogProps) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: deleteBeer,
    onSuccess: async () => {
      // Toutes les listes (pages, filtres) contiennent peut-être cette bière
      await queryClient.invalidateQueries({ queryKey: beerQueries.all });
      toast.success("Bière supprimée");
      onClose();
    },
    onError: (error) => {
      // 401 déjà signalé par le toast global « Session expirée » (App.tsx)
      if (error.status !== 401) toast.error(error.message);
    },
  });

  return (
    <ConfirmDeleteDialog
      open={beer !== null}
      title={`Supprimer « ${beer?.name} » ?`}
      description="Ses avis, photos et entrées de journal seront aussi supprimés."
      isPending={isPending}
      onConfirm={() => beer && mutate(beer.id)}
      onClose={onClose}
    />
  );
}
