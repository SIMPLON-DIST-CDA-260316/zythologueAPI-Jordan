import { beerQueries, type BeerTag } from "@/entities/beer";
import { useAuth } from "@/entities/session";
import { BeerFormSheet } from "@/features/beer-form";
import { formatAlcoholLevel, formatPrice } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
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

// /bieres/abc donne NaN : l'API répond 400 (id non conforme), traité comme un 404
const NOT_FOUND = [400, 404];

export function BeerDetailPage() {
  const id = Number(useParams().id);
  const [formOpen, setFormOpen] = useState(false);

  const { isAdmin } = useAuth();
  const {
    data: beer,
    isError,
    error,
  } = useQuery({ ...beerQueries.detail(id), enabled: isAdmin });

  return (
    <>
      <SiteHeader title={beer?.name ?? "Bière"} />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <Link
          to="/bieres"
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Toutes les bières
        </Link>
        {isError ? (
          <p className="text-sm text-destructive">
            {NOT_FOUND.includes(error.status)
              ? "Bière introuvable."
              : error.message}
          </p>
        ) : !beer ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{beer.name}</CardTitle>
              <CardDescription>
                <Link
                  to={`/brasseries/${beer.breweryId}`}
                  className="underline underline-offset-4"
                >
                  {beer.breweryName}
                </Link>
              </CardDescription>
              <CardAction>
                <Button variant="outline" onClick={() => setFormOpen(true)}>
                  <PencilIcon />
                  Modifier
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DetailItem label="Degré">
                  {formatAlcoholLevel(beer.alcoholLevel)}
                  {beer.isAlcoholFree && " (sans alcool)"}
                </DetailItem>
                <DetailItem label="Prix">{formatPrice(beer.price)}</DetailItem>
                <DetailItem label="Catégories">
                  <Tags tags={beer.categories} />
                </DetailItem>
                <DetailItem label="Ingrédients">
                  <Tags tags={beer.ingredients} />
                </DetailItem>
              </dl>
              {beer.description ? (
                <RichText html={beer.description} />
              ) : (
                <p className="text-muted-foreground">Pas de description.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      {beer && (
        <BeerFormSheet open={formOpen} beer={beer} onOpenChange={setFormOpen} />
      )}
    </>
  );
}

function Tags({ tags }: { tags: BeerTag[] }) {
  if (tags.length === 0) {
    return <span className="font-normal text-muted-foreground">Aucun</span>;
  }
  return (
    <ul className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <li
          key={tag.id}
          className="rounded-md bg-muted px-2 py-0.5 text-xs font-normal"
        >
          {tag.name}
        </li>
      ))}
    </ul>
  );
}
