import {
  categoryQueries,
  deleteCategory,
  type Category,
} from "@/entities/category";
import { ConfirmDeleteDialog } from "@/shared/ui/confirm-delete-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type DeleteCategoryDialogProps = {
  category: Category | null; // null = fermé
  onClose: () => void;
};

export function DeleteCategoryDialog({
  category,
  onClose,
}: DeleteCategoryDialogProps) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoryQueries.all });
      toast.success("Catégorie supprimée");
      onClose();
    },
    onError: (error) => {
      // 401 déjà signalé par le toast global « Session expirée » (App.tsx)
      if (error.status !== 401) toast.error(error.message);
    },
  });

  return (
    <ConfirmDeleteDialog
      open={category !== null}
      title={`Supprimer « ${category?.name} » ?`}
      description="Les bières de cette catégorie sont conservées, elles n'y seront simplement plus rattachées."
      isPending={isPending}
      onConfirm={() => category && mutate(category.id)}
      onClose={onClose}
    />
  );
}
