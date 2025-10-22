import { CashRegisterController } from "@/controllers/cash-register-controller";
import { autoIncrementCode } from "@/middlewares/autoIncrementCode";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { Router } from "express";

const cashRegisterRoutes = Router();
const cashRegisterController = new CashRegisterController();

cashRegisterRoutes.use(ensureAuthenticated);

cashRegisterRoutes.post(
  "/open",
  autoIncrementCode(["cashRegister", "cashMovement"]),
  cashRegisterController.openCash
);
cashRegisterRoutes.patch(
  "/:cashRegisterId/close",
  autoIncrementCode(["cashMovement"]),
  cashRegisterController.closedCash
);

export { cashRegisterRoutes };
