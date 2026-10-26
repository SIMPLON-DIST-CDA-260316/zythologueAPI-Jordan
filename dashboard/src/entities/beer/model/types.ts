// Miroir d'un élément de GET /beers (api/src/models/beer.ts). categories et
// ingredients n'existent que sur le détail : la liste n'en a pas besoin.
export type Beer = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  alcoholLevel: number;
  isAlcoholFree: boolean;
  breweryName: string;
  breweryId: number;
};

// Query params de GET /beers. Écrit à la main : getBeersQuerySchema décrit des
// chaînes d'URL (z.coerce), son type d'entrée ne servirait à rien ici.
export type BeerListParams = {
  page: number;
  limit: number;
  search?: string;
  breweryId?: number;
  isAlcoholFree?: boolean;
  sortBy?: "price" | "alcoholLevel";
  order?: "asc" | "desc";
};
