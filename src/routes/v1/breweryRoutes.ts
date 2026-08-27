import { Router } from "express";
import breweryPhotoRoutes from "./breweryPhotoRoutes.ts";

const router = Router();

// Le CRUD brasserie n'est pas encore implémenté : ce routeur n'existe pour
// l'instant que pour porter la sous-ressource photos. Les routes GET / POST /
// PATCH / DELETE sur /breweries viendront s'ajouter ici, au-dessus.

// Sous-ressource : photos d'une brasserie
router.use("/:id/photos", breweryPhotoRoutes);

export default router;
