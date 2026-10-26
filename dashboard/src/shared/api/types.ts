// Enveloppe commune des listes de l'API (beers, categories, ingredients…)
export type Paginated<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
