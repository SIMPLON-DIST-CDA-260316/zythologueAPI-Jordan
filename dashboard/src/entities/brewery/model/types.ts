// Miroir d'un élément de GET /breweries (api/src/models/brewery.ts)
export type Brewery = {
  id: number;
  name: string;
  description: string;
  country: string;
  city: string;
  website: string | null;
  beerCount: number;
};

// Query params de GET /breweries : la recherche s'appelle `name` côté API.
// country et city (égalité exacte) ne sont pas exposés par le dashboard
export type BreweryListParams = {
  page: number;
  limit: number;
  name?: string;
  sortBy?: "name";
  order?: "asc" | "desc";
};
