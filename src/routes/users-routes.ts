import { UserController } from "@/controller/users-controller";
import { Router } from "express";

const usersRoutes = Router();
const userController = new UserController();

usersRoutes.post("/", userController.create);

export { usersRoutes };
