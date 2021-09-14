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
    const message: any = [
        {
            type: "text",
            text: "หากมีข้อสงสัย ท่านสามารถติดต่อสาขาวิชาได้ ที่  : ######",
        },
        {
            type: "template",
            altText: "this is a buttons template",
            template: {
                type: "buttons",
                thumbnailImageUrl:
                    "https://www.howtogeek.com/wp-content/uploads/2021/01/Telegram-User-Making-a-Audio-and-Video-Call.png?height=200p&trim=2,2,2,2",
                imageBackgroundColor: "#FFFFFF",
                title: "ช่องทางการติดต่อ",
                text: "ท่านสามารถเลือกช่องทางการติดต่อสาขาวิชาได้ดังนี้",
                actions: [
                    {
                        type: "message",
                        label: "โทร",
                        text: "โทร",
                    },
                    {
                        type: "message",
                        label: "อีเมล",
                        text: "อีเมล",
                    },
                ],
            },
        },
        {
            type: "audio",
            originalContentUrl:
                "https://storage.itpsru.in.th/sar-dev/static_audio_not-my-senpai.mp3",
            duration: 2000,
        },
    ];

    const getProfile = await client.getBotInfo();
    console.log(getProfile);

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
};
