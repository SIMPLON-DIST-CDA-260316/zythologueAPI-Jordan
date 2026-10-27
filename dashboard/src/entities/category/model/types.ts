// Miroir d'un élément de GET /categories (api/src/models/category.ts)
export type Category = {
  id: number;
  name: string;
  description: string;
};

// Query params de GET /categories : la recherche s'appelle `name` côté API
export type CategoryListParams = {
  page: number;
  limit: number;
  name?: string;
  sortBy?: "name";
  order?: "asc" | "desc";
};
