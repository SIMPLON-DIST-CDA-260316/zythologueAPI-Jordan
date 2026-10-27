// Miroir d'un élément de GET /ingredients (api/src/models/ingredient.ts)
export type Ingredient = {
  id: number;
  name: string;
  description: string | null;
};

// Query params de GET /ingredients : la recherche s'appelle `name` côté API
export type IngredientListParams = {
  page: number;
  limit: number;
  name?: string;
  sortBy?: "name";
  order?: "asc" | "desc";
};
