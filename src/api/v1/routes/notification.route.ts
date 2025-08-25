import { Router } from "express";
import { NotifiController } from "~/api/v1/controllers/notification.controller";
import { AuthMiddleWare } from "~/api/v1/middlewares/auth.middleware";

export const notifiRouter = Router()
const notifiController = new NotifiController()
const authMiddleWare = new AuthMiddleWare()

notifiRouter.get('/', authMiddleWare.verifyAT, notifiController.notification)