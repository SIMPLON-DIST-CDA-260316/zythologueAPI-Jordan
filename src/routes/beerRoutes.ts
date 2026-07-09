import { Router } from "express";
import { BeerController } from "../controllers/beerController.ts";
import { pool } from "../db.ts";
import { BeerRepository } from "../repositories/beerRepository.ts";
import { BeerService } from "../services/beerService.ts";

const beerRepository = new BeerRepository(pool);
const beerService = new BeerService(beerRepository);
const beerController = new BeerController(beerService);

const router = Router();

// Route racine de l'API beers : récupère toutes les bières
router.get("/", beerController.getAll);

// Route pour récupérer une bière par son id
router.get("/:id", beerController.getOneById);

// Route pour supprimer une bière par son id
router.delete("/:id", beerController.deleteOneById);

// Route pour ajouter une bière
router.post("/", beerController.addOne);

export default router;
