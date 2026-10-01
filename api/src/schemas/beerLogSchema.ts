import { z } from "zod";

export const getBeerLogsQuerySchema = z
  .object({
    beerId: z.coerce.number().int().positive().optional(),
    order: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(5),
  })
  .strict();

export type GetBeerLogsQuery = z.infer<typeof getBeerLogsQuerySchema>;
