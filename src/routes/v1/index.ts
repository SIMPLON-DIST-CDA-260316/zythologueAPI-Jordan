import { Router } from "express";
import beerLogRoutes from "./beerLogRoutes.ts";
import beerRoutes from "./beerRoutes.ts";
import breweryRoutes from "./breweryRoutes.ts";
import categoryRoutes from "./categoryRoutes.ts";

const router = Router();

router.use("/beers", beerRoutes);
router.use("/beer-logs", beerLogRoutes);
router.use("/breweries", breweryRoutes);
router.use("/categories", categoryRoutes);

export default router;
