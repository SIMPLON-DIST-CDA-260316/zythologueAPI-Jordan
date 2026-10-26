import { breweryQueries } from "@/entities/brewery";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon, XIcon } from "lucide-react";
import type { BeerSearchParams } from "../model/useBeerSearchParams";

// Valeur sentinelle des Select pour « pas de filtre » (retirée de l'URL)
const ALL = "all";

const alcoholItems = [
  { value: ALL, label: "Toutes" },
  { value: "false", label: "Avec alcool" },
  { value: "true", label: "Sans alcool" },
];

type BeersToolbarProps = {
  params: BeerSearchParams;
  setParams: (patch: Partial<BeerSearchParams>) => void;
  clearParams: () => void;
};

export function BeersToolbar({
  params,
  setParams,
  clearParams,
}: BeersToolbarProps) {
  const { data: breweries = [] } = useQuery(breweryQueries.options());
  const breweryItems = [
    { value: ALL, label: "Toutes les brasseries" },
    ...breweries.map((b) => ({ value: String(b.id), label: b.name })),
  ];

  const hasActiveParams =
    !!params.search ||
    params.breweryId !== undefined ||
    params.isAlcoholFree !== undefined ||
    params.sortBy !== undefined;

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const search = new FormData(event.currentTarget).get("search");
    setParams({ search: typeof search === "string" ? search.trim() : "" });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Recherche validée par Entrée : une requête par recherche, pas par
          frappe. La key resynchronise le champ quand l'URL change (retour,
          réinitialisation) */}
      <form
        key={params.search ?? ""}
        role="search"
        onSubmit={handleSearch}
        className="relative w-full sm:w-64"
      >
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          name="search"
          defaultValue={params.search}
          placeholder="Rechercher une bière…"
          aria-label="Rechercher une bière par son nom"
          maxLength={100}
          className="pl-8"
        />
      </form>

      <Select
        items={breweryItems}
        value={params.breweryId === undefined ? ALL : String(params.breweryId)}
        onValueChange={(value) =>
          setParams({
            breweryId: value && value !== ALL ? Number(value) : undefined,
          })
        }
      >
        <SelectTrigger className="w-52" aria-label="Filtrer par brasserie">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {breweryItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={alcoholItems}
        value={
          params.isAlcoholFree === undefined ? ALL : String(params.isAlcoholFree)
        }
        onValueChange={(value) =>
          setParams({
            isAlcoholFree: value && value !== ALL ? value === "true" : undefined,
          })
        }
      >
        <SelectTrigger className="w-36" aria-label="Filtrer par alcool">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {alcoholItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveParams && (
        <Button variant="ghost" onClick={clearParams}>
          <XIcon />
          Réinitialiser
        </Button>
      )}
    </div>
  );
}
