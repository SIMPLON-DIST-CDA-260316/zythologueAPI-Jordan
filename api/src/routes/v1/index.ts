import { Router } from "express";
import access from "./access.ts";
import authRoutes from "./authRoutes.ts";
import beerLogRoutes from "./beerLogRoutes.ts";
import beerRoutes from "./beerRoutes.ts";
import breweryRoutes from "./breweryRoutes.ts";
import categoryRoutes from "./categoryRoutes.ts";
import ingredientRoutes from "./ingredientRoutes.ts";
import statsRoutes from "./statsRoutes.ts";

const router = Router();

// Toujours en premier : refuse toute route non déclarée dans access.ts
router.use(access);

router.use("/beers", beerRoutes);
router.use("/beer-logs", beerLogRoutes);
router.use("/breweries", breweryRoutes);
router.use("/categories", categoryRoutes);
router.use("/ingredients", ingredientRoutes);
router.use("/stats", statsRoutes);
router.use("/auth", authRoutes);

export default router;
