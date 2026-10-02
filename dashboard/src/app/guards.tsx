import { useAuth } from "@/entities/session";
import { Loader2Icon } from "lucide-react";
import { Navigate, Outlet } from "react-router";

// Protection côté front = confort d'affichage. La vraie protection reste
// l'API : sans cookie valide (ou sans rôle admin), elle ne renvoie rien.

function FullPageLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      <span className="sr-only">Chargement…</span>
    </div>
  );
}

export function RequireAuth() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// À placer sous RequireAuth : user est forcément défini ici
export function RequireAdmin() {
  const { user } = useAuth();
  if (user?.role !== "admin") return <Navigate to="/acces-refuse" replace />;
  return <Outlet />;
}

export function GuestOnly() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <FullPageLoader />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
