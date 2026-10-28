// Agrégats calculés par PostgreSQL pour l'accueil du dashboard (lecture seule)
export interface Stats {
  totals: {
    beers: number;
    breweries: number;
    reviews: number;
    // null tant qu'aucun avis n'existe
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
}
