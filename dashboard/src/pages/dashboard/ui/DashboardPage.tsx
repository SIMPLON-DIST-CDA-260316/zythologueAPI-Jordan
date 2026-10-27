import { useAuth } from "@/entities/session";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { SiteHeader } from "@/widgets/site-header";
import { Link } from "react-router";

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
              Espace d'administration de Zythologue. Gérez le catalogue (
              <Link to="/bieres" className="underline underline-offset-4">
                bières
              </Link>
              ,{" "}
              <Link to="/brasseries" className="underline underline-offset-4">
                brasseries
              </Link>
              ,{" "}
              <Link to="/categories" className="underline underline-offset-4">
                catégories
              </Link>
              ,{" "}
              <Link to="/ingredients" className="underline underline-offset-4">
                ingrédients
              </Link>
              ) et consultez le{" "}
              <Link to="/journal" className="underline underline-offset-4">
                journal des ajouts
              </Link>
              .
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </>
  );
}
