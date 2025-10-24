import { Router } from "express";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { autoIncrementCode } from "@/middlewares/autoIncrementCode";
import { SalesController } from "@/controllers/sales-controller";

const saleRoutes = Router();
const salesController = new SalesController();

saleRoutes.use(ensureAuthenticated);

saleRoutes.get("/", salesController.index);
saleRoutes.get("/:saleId", salesController.show);
saleRoutes.post("/", autoIncrementCode(["sale", "cashMovement"]), salesController.create);
saleRoutes.put("/:saleId", salesController.update);
saleRoutes.patch("/:saleId/cancel", autoIncrementCode(["cashMovement"]), salesController.cancel);

export { saleRoutes };