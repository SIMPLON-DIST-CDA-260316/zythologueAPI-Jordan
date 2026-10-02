import { useAuth } from "@/entities/session";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { BeerIcon } from "lucide-react";

// Page d'un utilisateur connecté mais sans le rôle admin
export function ForbiddenPage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <span className="flex items-center gap-2 self-center font-medium">
          <BeerIcon className="size-5" /> Zythologue
        </span>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Accès réservé</CardTitle>
            <CardDescription>
              Vous êtes connecté en tant que {user?.firstName} {user?.lastName}{" "}
              ({user?.email}), mais le tableau de bord est réservé aux
              administrateurs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full cursor-pointer"
              onClick={() => logout()}
            >
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
