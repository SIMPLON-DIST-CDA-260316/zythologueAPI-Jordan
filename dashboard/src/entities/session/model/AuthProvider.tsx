import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getMe, logout as logoutApi, ME_QUERY_KEY } from "../api/sessionApi";
import { AuthContext } from "./authContext";

// L'utilisateur n'est pas copié dans un state : il vit dans le cache
// TanStack Query (clé ["me"]), le Context ne fait que l'exposer.
// Les redirections sont faites par les guards (app/guards.tsx) qui
// réagissent à ce cache : ni login ni logout n'appellent navigate.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user = null, isPending } = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: getMe,
    retry: false, // API arrêtée : pas 3 tentatives avant d'afficher le login
  });

  const { mutate: logout } = useMutation({
    mutationFn: logoutApi,
    // Seulement en cas de succès : si l'API n'a pas supprimé le cookie,
    // l'utilisateur serait de nouveau connecté au prochain chargement
    onSuccess: () => queryClient.setQueryData(ME_QUERY_KEY, null),
    onError: (error) => toast.error(error.message),
  });

  return (
    <AuthContext.Provider value={{ user, isLoading: isPending, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
