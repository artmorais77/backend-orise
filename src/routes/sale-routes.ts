import { Router } from "express";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { autoIncrementCode } from "@/middlewares/autoIncrementCode";
import { SaleController } from "@/controllers/sale-controller";

const saleRoutes = Router();
const saleController = new SaleController();

saleRoutes.use(ensureAuthenticated);

saleRoutes.post("/", autoIncrementCode(["sale", "cashMovement"]), saleController.create);
saleRoutes.put("/:saleId", saleController.update);

export { saleRoutes };
