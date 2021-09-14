import { Request, Response } from "express";
import { middleware } from "@line/bot-sdk";
import * as line from "@line/bot-sdk";
import { GetContact } from "../service/messageService";
/**
 * GET /
 * Home page.
 */

const client = new line.Client({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

export const index = async (req: Request, res: Response): Promise<void> => {
    res.status(404).send();
};

export const webhook = async (req: Request, res: Response): Promise<void> => {
    const userMessage = req.body.events[0].message.text;
    const userId = req.body.events[0].source.userId;
    const replyToken = req.body.events[0].replyToken;
    console.log("received message : %s from id : %s", userMessage, userId);
    switch (userMessage) {
        case "ติดต่อสาขาวิชา":
            return GetContact(userId, userMessage, replyToken);
            break;
        default:
            break;
    }
};
