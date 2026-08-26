import { Router } from "express";
import beerLogRoutes from "./beerLogRoutes.ts";
import beerRoutes from "./beerRoutes.ts";

const router = Router();

router.use("/beers", beerRoutes);
router.use("/beer-logs", beerLogRoutes);

export default router;
