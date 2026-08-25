import { Router } from "express";
import { BeerLogController } from "../controllers/beerLogController.ts";
import { pool } from "../db.ts";
import { BeerLogRepository } from "../repositories/beerLogRepository.ts";
import { BeerLogService } from "../services/beerLogService.ts";

const beerLogRepository = new BeerLogRepository(pool);
const beerLogService = new BeerLogService(beerLogRepository);
const beerLogController = new BeerLogController(beerLogService);

const router = Router();

// Route racine de l'API beer-logs : récupère le journal des insertions de bières
// TODO (phase 3 de la roadmap) : protéger cette route avec authenticate + requireAdmin
router.get("/", beerLogController.getAll);

export default router;
