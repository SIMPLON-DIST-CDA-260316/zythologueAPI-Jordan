import { useAuth } from "@/entities/session";
import { Button } from "@/shared/ui/button";

// ponytail: version provisoire, remplacée par le layout sidebar à l'étape 6
export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col items-start gap-4 p-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p>Bonjour {user?.firstName}, vous êtes connecté en tant qu'admin.</p>
      <Button className="cursor-pointer" onClick={() => logout()}>
        Se déconnecter
      </Button>
    </div>
  );
}
