import { Router } from "express";
import * as controller from "../controllers/api";
export const api = Router();
api.get("/", controller.ApiHello);
api.get("/auth", controller.ApiAuth);
api.get("/get-liff-id", controller.ApiLiffId);
