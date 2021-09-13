import { Request, Response } from "express";
import { middleware } from "@line/bot-sdk";
import * as line from "@line/bot-sdk";
/**
 * GET /
 * Home page.
 */

const client  = new line.Client({
    channelAccessToken:process.env.LINE_CHANNEL_ACCESS_TOKEN,
});
export const index = async (req: Request, res: Response): Promise<void> => {
    res.status(404).send();
};

export const webhook = async (req: Request, res: Response): Promise<void> => {
    const message:any = {
        "type": "text",
        "text": "ขอขอบคุณ -คุณลูกค้ามากๆครับที่มาใช้บริการถ่ายภาพของเรา😍📸 \n Facebook: Sakon Damminsek \n เบอร์ติดต่อส่วนตัวช่างภาพ    \n📱(0658273828)",
    };

    console.log(req.body.events[0].message.text);
    console.log(req.body.events[0].source.userId);
    client.pushMessage(req.body.events[0].source.userId, message).then(() => {
        console.log("Message has been sent");
    }).catch((err) => {
        console.error("Message has been sent");
    });
   
};
