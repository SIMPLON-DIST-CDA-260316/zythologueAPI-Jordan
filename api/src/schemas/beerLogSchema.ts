import { z } from "zod";
import { idSchema } from "./idSchema.ts";

export const getBeerLogsQuerySchema = z
  .object({
    beerId: idSchema.optional(),
    order: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(5),
  })
  .strict();

export type GetBeerLogsQuery = z.infer<typeof getBeerLogsQuerySchema>;
