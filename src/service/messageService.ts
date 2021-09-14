import * as line from "@line/bot-sdk";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const client = new line.Client({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

export const GetContact = async (
    userId: string,
    userMessage: string,
    replyToken: string,
): Promise<void> => {
    const message: any = {
        type: "text",
        text: "หากมีข้อสงสัย ท่านสามารถติดต่อสาขาวิชาได้ ที่  : ######",
    };
    await prisma.messageLog.create({
        data: {
            userId: userId,
            message: userMessage,
            isCorrect: true,
        },
    });
    client
        .replyMessage(replyToken, message)
        .then(() => {
            console.log("Message has been sent to : %s", userId);
        })
        .catch(err => {
            console.error("Failed to send message:", err);
        });
    // client
    //     .pushMessage(userId, message)
    //     .then(() => {
    //         console.log("Message has been sent to : %s", userId);
    //     })
    //     .catch(err => {
    //         console.error("Failed to send message:", err);
    //     });
};
