import { SessionController } from "@/controller/session-controller";
import { Router } from "express";

const sessionRoutes = Router();
const sessionController = new SessionController();

sessionRoutes.post("/", sessionController.login);

export { sessionRoutes };
