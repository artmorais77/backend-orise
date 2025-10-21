import { Router } from "express";
import { usersRoutes } from "./users-routes";
import { sessionRoutes } from "./session-routes";
import { productsRoutes } from "./products-routes";

const routes = Router();

routes.use("/users", usersRoutes);
routes.use("/session", sessionRoutes);
routes.use("/products", productsRoutes);

export { routes };
