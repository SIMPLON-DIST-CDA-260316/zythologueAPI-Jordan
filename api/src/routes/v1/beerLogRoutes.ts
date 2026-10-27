import { Router } from "express";
import { BeerLogController } from "../../controllers/beerLogController.ts";
import { pool } from "../../db.ts";
import { requireAdmin } from "../../middlewares/auth.ts";
import { validate } from "../../middlewares/validate.ts";
import { BeerLogRepository } from "../../repositories/beerLogRepository.ts";
import { getBeerLogsQuerySchema } from "../../schemas/beerLogSchema.ts";
import { BeerLogService } from "../../services/beerLogService.ts";

const beerLogRepository = new BeerLogRepository(pool);
const beerLogService = new BeerLogService(beerLogRepository);
const beerLogController = new BeerLogController(beerLogService);

const router = Router();

// Route racine de l'API beer-logs : récupère le journal des insertions de bières
// Réservé aux admins : le journal d'audit n'est pas public
router.get(
  "/",
  requireAdmin,
  validate(getBeerLogsQuerySchema, "query"),
  beerLogController.getAll,
);

export default router;
