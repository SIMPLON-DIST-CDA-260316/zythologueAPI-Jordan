import { z } from "zod";

const MESSAGE = "L'identifiant n'est pas conforme";

// Les ids sont des INTEGER Postgres : au-delà, la requête SQL échouerait
// (500 « out of range ») au lieu d'un 400 lisible
export const MAX_ID = 2_147_483_647;

// Id lu dans l'URL (params, query) : une chaîne, d'où z.coerce
export const idSchema = z.coerce
  .number(MESSAGE)
  .int(MESSAGE)
  .positive(MESSAGE)
  .max(MAX_ID, MESSAGE);

// Id lu dans un body JSON : déjà un nombre, sans coercition (true deviendrait 1)
export const bodyIdSchema = z
  .number(MESSAGE)
  .int(MESSAGE)
  .positive(MESSAGE)
  .max(MAX_ID, MESSAGE);
