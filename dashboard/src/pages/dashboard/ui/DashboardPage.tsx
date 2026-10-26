import { useAuth } from "@/entities/session";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { SiteHeader } from "@/widgets/site-header";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <>
      <SiteHeader title="Tableau de bord" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Bienvenue, {user?.firstName}</CardTitle>
            <CardDescription>
              Espace d'administration de Zythologue. La gestion des bières,
              brasseries, catégories et ingrédients arrivera ici.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </>
  );
}
