import { beerQueries, deleteBeer, type Beer } from "@/entities/beer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
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
    <AlertDialog
      open={beer !== null}
      onOpenChange={(open) => !open && !isPending && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer « {beer?.name} » ?</AlertDialogTitle>
          <AlertDialogDescription>
            Ses avis, photos et entrées de journal seront aussi supprimés.
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={() => beer && mutate(beer.id)}
          >
            {isPending ? "Suppression…" : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
