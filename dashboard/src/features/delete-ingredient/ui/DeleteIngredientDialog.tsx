import {
  ingredientQueries,
  deleteIngredient,
  type Ingredient,
} from "@/entities/ingredient";
import { ConfirmDeleteDialog } from "@/shared/ui/confirm-delete-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type DeleteIngredientDialogProps = {
  ingredient: Ingredient | null; // null = fermé
  onClose: () => void;
};

export function DeleteIngredientDialog({
  ingredient,
  onClose,
}: DeleteIngredientDialogProps) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: deleteIngredient,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ingredientQueries.all });
      toast.success("Ingrédient supprimé");
      onClose();
    },
    onError: (error) => {
      // 401 déjà signalé par le toast global « Session expirée » (App.tsx)
      if (error.status !== 401) toast.error(error.message);
    },
  });

  return (
    <ConfirmDeleteDialog
      open={ingredient !== null}
      title={`Supprimer « ${ingredient?.name} » ?`}
      description="Les bières qui le contiennent sont conservées, il sera simplement retiré de leur composition."
      isPending={isPending}
      onConfirm={() => ingredient && mutate(ingredient.id)}
      onClose={onClose}
    />
  );
}
