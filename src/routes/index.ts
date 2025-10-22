import { Router } from "express";
import { usersRoutes } from "./users-routes";
import { sessionRoutes } from "./session-routes";
import { productsRoutes } from "./products-routes";
import { cashRegisterRoutes } from "./cash-register-routes";

const routes = Router();

routes.use("/users", usersRoutes);
routes.use("/session", sessionRoutes);
routes.use("/products", productsRoutes);
routes.use("/cash-registers", cashRegisterRoutes);

export { routes };
