import { formatGrade } from "@/shared/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Link } from "react-router";
import type { Stats } from "../model/types";

// Liste HTML plutôt que recharts : chaque nom est un vrai lien, atteignable
// au clavier, ce qu'une barre SVG cliquable n'est pas
export function TopRatedBeers({ beers }: { beers: Stats["topRatedBeers"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Les mieux notées</CardTitle>
        <CardDescription>Top 5 par note moyenne sur 10</CardDescription>
      </CardHeader>
      <CardContent>
        {beers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun avis pour l'instant.
          </p>
        ) : (
          <ol className="flex flex-col gap-3">
            {beers.map((beer) => (
              <li key={beer.id} className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between gap-2">
                  <Link
                    to={`/bieres/${beer.id}`}
                    className="truncate underline-offset-4 hover:underline"
                  >
                    {beer.name}
                  </Link>
                  <span className="shrink-0 tabular-nums">
                    {formatGrade(beer.averageGrade)}
                    <span className="text-muted-foreground">
                      {" "}
                      ({beer.reviewCount} avis)
                    </span>
                  </span>
                </div>
                {/* Décoratif : la note est déjà écrite juste au-dessus */}
                <div aria-hidden className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-chart-2"
                    style={{ width: `${beer.averageGrade * 10}%` }}
                  />
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
