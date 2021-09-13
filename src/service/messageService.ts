import * as line from "@line/bot-sdk";
/**
 * GET /
 * Home page.
 */

const client = new line.Client({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

export const GetContact = async (userId: string): Promise<void> => {
    const message: any = {
        type: "text",
        text: "หากมีข้อสงสัย ท่านสามารถติดต่อสาขาวิชาได้ ที่  : ######",
    };
    client
        .pushMessage(userId, message)
        .then(() => {
            console.log("Message has been sent");
        })
        .catch(err => {
            console.error("Failed to send message:", err);
        });
};
