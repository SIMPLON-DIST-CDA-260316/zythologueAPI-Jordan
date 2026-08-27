import { Router } from "express";
import beerLogRoutes from "./beerLogRoutes.ts";
import beerRoutes from "./beerRoutes.ts";
import breweryRoutes from "./breweryRoutes.ts";

const router = Router();

router.use("/beers", beerRoutes);
router.use("/beer-logs", beerLogRoutes);
router.use("/breweries", breweryRoutes);

export default router;
