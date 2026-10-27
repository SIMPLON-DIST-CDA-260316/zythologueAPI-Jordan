// Miroir d'un élément de GET /beer-logs (api/src/models/beerLog.ts). Rempli par
// un trigger SQL à chaque INSERT de bière : action vaut toujours "INSERT", et
// loggedBy est le rôle Postgres, pas l'admin connecté (non affiché)
export type BeerLog = {
  id: number;
  beerId: number;
  beerName: string;
  action: "INSERT";
  loggedAt: string; // ISO 8601 : le JSON n'a pas de type Date
  loggedBy: string;
};

// Query params de GET /beer-logs (ordre par défaut de l'API : plus récent d'abord)
export type BeerLogListParams = {
  page: number;
  limit: number;
};
