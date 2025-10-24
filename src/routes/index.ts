import { Router } from "express";
import { usersRoutes } from "./users-routes";
import { sessionsRoutes } from "./sessions-routes";
import { productsRoutes } from "./products-routes";
import { cashRegisterRoutes } from "./cash-register-routes";
import { saleRoutes } from "./sale-routes";

const routes = Router();

routes.use("/users", usersRoutes);
routes.use("/session", sessionsRoutes);
routes.use("/products", productsRoutes);
routes.use("/cash-registers", cashRegisterRoutes);
routes.use("/sales", saleRoutes);

export { routes };
