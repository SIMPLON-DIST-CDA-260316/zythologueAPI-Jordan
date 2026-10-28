import { Router } from "express";
import { StatsController } from "../../controllers/statsController.ts";
import { pool } from "../../db.ts";
import { requireAdmin } from "../../middlewares/auth.ts";
import { StatsRepository } from "../../repositories/statsRepository.ts";
import { StatsService } from "../../services/statsService.ts";

const statsRepository = new StatsRepository(pool);
const statsService = new StatsService(statsRepository);
const statsController = new StatsController(statsService);

const router = Router();

// KPI de l'accueil du dashboard, réservés aux admins comme le journal
router.get("/", requireAdmin, statsController.getStats);

export default router;
