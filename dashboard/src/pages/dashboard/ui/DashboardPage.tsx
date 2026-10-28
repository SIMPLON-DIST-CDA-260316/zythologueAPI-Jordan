import { useAuth } from "@/entities/session";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { SiteHeader } from "@/widgets/site-header";
import { useQuery } from "@tanstack/react-query";
import { statsQueries } from "../api/statsApi";
import { AlcoholLevelChart } from "./AlcoholLevelChart";
import { BeersByCategoryChart } from "./BeersByCategoryChart";
import { KpiCards } from "./KpiCards";
import { TopRatedBeers } from "./TopRatedBeers";

export function DashboardPage() {
  // Pas de fetch sans droits, même si la page était montée hors de
  // RequireAdmin (défense en profondeur : la vraie barrière reste l'API)
  const { user, isAdmin } = useAuth();
  const {
    data: stats,
    isError,
    error,
  } = useQuery({ ...statsQueries.overview(), enabled: isAdmin });

  return (
    <>
      <SiteHeader title="Tableau de bord" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Bienvenue, {user?.firstName}</CardTitle>
            <CardDescription>
              Vue d'ensemble du catalogue Zythologue.
            </CardDescription>
          </CardHeader>
        </Card>
        {isError ? (
          <p className="text-sm text-destructive">{error.message}</p>
        ) : !stats ? (
          <>
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </>
        ) : (
          <>
            <KpiCards totals={stats.totals} />
            <div className="grid gap-4 lg:grid-cols-2">
              <BeersByCategoryChart data={stats.beersByCategory} />
              <div className="flex flex-col gap-4">
                <AlcoholLevelChart data={stats.beersByAlcoholLevel} />
                <TopRatedBeers beers={stats.topRatedBeers} />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
