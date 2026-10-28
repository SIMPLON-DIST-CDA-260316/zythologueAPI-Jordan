import { beerQueries } from "@/entities/beer";
import { breweryQueries } from "@/entities/brewery";
import { useAuth } from "@/entities/session";
import { BreweryFormSheet } from "@/features/brewery-form";
import { formatAlcoholLevel, formatPrice } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { DetailItem } from "@/shared/ui/detail-item";
import { RichText } from "@/shared/ui/rich-text";
import { Skeleton } from "@/shared/ui/skeleton";
import { SiteHeader } from "@/widgets/site-header";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";

// /brasseries/abc donne NaN : l'API répond 400 (id non conforme), traité comme un 404
const NOT_FOUND = [400, 404];

export function BreweryDetailPage() {
  const id = Number(useParams().id);
  const [formOpen, setFormOpen] = useState(false);

  const { isAdmin } = useAuth();
  const {
    data: brewery,
    isError,
    error,
  } = useQuery({ ...breweryQueries.detail(id), enabled: isAdmin });
  // shortcut: 100 bières max (limite de l'API), paginer si une brasserie en a plus
  const { data: beers } = useQuery({
    ...beerQueries.list({ page: 1, limit: 100, breweryId: id }),
    // Pas les bières de la brasserie précédente pendant le chargement
    placeholderData: undefined,
    enabled: isAdmin && !!brewery,
  });

  return (
    <>
      <SiteHeader title={brewery?.name ?? "Brasserie"} />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <Link
          to="/brasseries"
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Toutes les brasseries
        </Link>
        {isError ? (
          <p className="text-sm text-destructive">
            {NOT_FOUND.includes(error.status)
              ? "Brasserie introuvable."
              : error.message}
          </p>
        ) : !brewery ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{brewery.name}</CardTitle>
                <CardAction>
                  <Button variant="outline" onClick={() => setFormOpen(true)}>
                    <PencilIcon />
                    Modifier
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <dl className="grid gap-4 sm:grid-cols-3">
                  <DetailItem label="Ville">{brewery.city}</DetailItem>
                  <DetailItem label="Pays">{brewery.country}</DetailItem>
                  <DetailItem label="Site web">
                    {brewery.website ? (
                      // Le schéma de l'API n'accepte que http(s) : pas de javascript: ici
                      <a
                        href={brewery.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-primary underline underline-offset-4"
                      >
                        {brewery.website}
                      </a>
                    ) : (
                      <span className="font-normal text-muted-foreground">
                        Aucun
                      </span>
                    )}
                  </DetailItem>
                </dl>
                <RichText html={brewery.description} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Bières{beers && ` (${beers.total})`}</CardTitle>
              </CardHeader>
              <CardContent>
                {!beers ? (
                  <Skeleton className="h-24" />
                ) : beers.data.length === 0 ? (
                  <p className="text-muted-foreground">
                    Aucune bière pour cette brasserie.
                  </p>
                ) : (
                  <ul className="divide-y">
                    {beers.data.map((beer) => (
                      <li
                        key={beer.id}
                        className="flex flex-wrap items-center justify-between gap-2 py-2"
                      >
                        <Link
                          to={`/bieres/${beer.id}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {beer.name}
                        </Link>
                        <span className="text-muted-foreground">
                          {formatAlcoholLevel(beer.alcoholLevel)} ·{" "}
                          {formatPrice(beer.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
      {brewery && (
        <BreweryFormSheet
          open={formOpen}
          brewery={brewery}
          onOpenChange={setFormOpen}
        />
      )}
    </>
  );
}
