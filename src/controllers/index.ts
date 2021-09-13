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

    const userMessage = req.body.events[0].message.text;
    const userId = req.body.events[0].source.userId;
    console.log({userMessage});
    console.log({userId});
   
    const template:any = {
        "template": {
            "type": "buttons",
            "actions": [
              {
                "uri": "https://www.facebook.com/Sakondamminsek2401",
                "label": "ติดต่อช่างภาพโดยตรง",
                "type": "uri",
              },
              {
                "label": "เบอร์ที่สามารถติดต่อ",
                "text": "0658273828",
                "type": "postback",
                "data": "0658273828",
              },
            ],
            "title": "ติดต่อช่างภาพโดยตรง",
            "thumbnailImageUrl": "https://sv1.picz.in.th/images/2020/09/20/O5Df7E.md.jpg",
            "text": "ทางเราจะติดต่อกลับไปให้ไวที่สุ๊ดดดด 👌😁📱",
          },
          "type": "template",
          "altText": "this is a buttons template",
        
    };
    switch(userMessage){
        case "ติดต่อช่างภาพโดยตรง":
            const message:any = {
                "type": "text",
                "text": "ขอขอบคุณ -คุณลูกค้ามากๆครับที่มาใช้บริการถ่ายภาพของเรา😍📸 \n Facebook: Sakon Damminsek \n เบอร์ติดต่อส่วนตัวช่างภาพ    \n📱(0658273828)",
                ...template
            };
            client.pushMessage(req.body.events[0].source.userId, message).then(() => {
                console.log("Message has been sent");
            }).catch((err) => {
                console.error("Message has been sent");
            });
        break;
        default:
            break;
    }
   
};
