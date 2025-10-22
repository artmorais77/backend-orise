import { CashRegisterController } from "@/controllers/cash-register-controller";
import { autoIncrementCode } from "@/middlewares/autoIncrementCode";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { Router } from "express";

const cashRegisterRoutes = Router();
const cashRegisterController = new CashRegisterController();

cashRegisterRoutes.use(ensureAuthenticated);

cashRegisterRoutes.get(
  "/current",
  cashRegisterController.show
)

cashRegisterRoutes.post(
  "/open",
  autoIncrementCode(["cashRegister", "cashMovement"]),
  cashRegisterController.openCash
);
cashRegisterRoutes.patch(
  "/:cashRegisterId/close",
  autoIncrementCode(["cashMovement"]),
  cashRegisterController.closeCash
);

export { cashRegisterRoutes };
