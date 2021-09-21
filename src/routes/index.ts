import { Router } from "express";
import * as controller from "../controllers/index";
import { middleware } from "@line/bot-sdk";
export const index = Router();
const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
};
index.get("/", controller.index);
index.post("/webhook", middleware(config), controller.webhook);
index.post("/callback", middleware(config), controller.Callback);
index.get("/liff-apps", controller.liffApps);
