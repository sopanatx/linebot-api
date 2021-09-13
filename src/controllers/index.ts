import { Request, Response } from "express";
import { middleware } from "@line/bot-sdk";
/**
 * GET /
 * Home page.
 */

export const index = async (req: Request, res: Response): Promise<void> => {
    res.status(404).send();
};

export const webhook = async (req: Request, res: Response): Promise<void> => {
    console.log(req.body.events);
    console.log(req.body.destination);
    res.status(200).send({
        status: "ok",
        message: "Webhook received",
    });
};
