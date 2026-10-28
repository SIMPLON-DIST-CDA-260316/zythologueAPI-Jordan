// Réponse de GET /stats (api/src/models/stats.ts)
export type Stats = {
  totals: {
    beers: number;
    breweries: number;
    reviews: number;
    averageGrade: number | null;
  };
  beersByCategory: { name: string; count: number }[];
  beersByAlcoholLevel: { range: string; count: number }[];
  topRatedBeers: {
    id: number;
    name: string;
    averageGrade: number;
    reviewCount: number;
  }[];
};
