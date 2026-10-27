import { breweryQueries } from "@/entities/brewery";
import { Button } from "@/shared/ui/button";
import { SearchInput } from "@/shared/ui/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useQuery } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchInput
        value={params.search}
        onSearch={(search) => setParams({ search })}
        placeholder="Rechercher une bière…"
        label="Rechercher une bière par son nom"
      />

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
