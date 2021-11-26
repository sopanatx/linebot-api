import * as line from '@line/bot-sdk'
import { PrismaClient } from '@prisma/client'
import * as cron from 'node-cron'

const prisma = new PrismaClient()
const client = new line.Client({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
})

export const GetContact = async (
    userId: string,
    userMessage: string,
    replyToken: string
): Promise<void> => {
    const message: any = [
        {
            type: 'template',
            altText: 'this is a carousel template',
            template: {
                type: 'carousel',
                columns: [
                    {
                        thumbnailImageUrl:
                            'https://www.img.in.th/images/de18c636ceaeb5c959b9454f74401cb8.jpg',
                        title: 'อาจารย์ ไพฑูรย์ งิ้วทั่ง',
                        text: 'ประธานหลักสูตรสาขาวิชาเทคโนโลยีสารสนเทศ',
                        actions: [
                            {
                                type: 'uri',
                                label: 'ดูเพิ่มเติม',
                                uri: 'https://itpsru.in.th/personal/',
                            },
                        ],
                    },
                    {
                        thumbnailImageUrl:
                            'https://www.img.in.th/images/fe141ae4faab6a378cd11733a3ac6b70.jpg',
                        title: 'ผู้ช่วยศาสตราจารย์ ดร.กิตติพงษ์ สุวรรณรา',
                        text: 'กรรมการประจําหลักสูตร, ผู้ช่วยอธิการบดีฝ่ายเทคโนโลยีสารสนเทศ',
                        actions: [
                            {
                                type: 'uri',
                                label: 'ดูเพิ่มเติม',
                                uri: 'https://itpsru.in.th/personal/',
                            },
                        ],
                    },
                    {
                        thumbnailImageUrl:
                            'https://www.img.in.th/images/ca6c5ba69147551ac59ebca701cd522f.jpg',
                        title: 'อาจารย์ พงษ์พิชญ์ เลิศเจริญวุฒา',
                        text: 'กรรมการประจําหลักสูตร',
                        actions: [
                            {
                                type: 'uri',
                                label: 'ดูเพิ่มเติม',
                                uri: 'https://itpsru.in.th/personal/',
                            },
                        ],
                    },
                    {
                        thumbnailImageUrl:
                            'https://www.img.in.th/images/e8b36b4a42b1bad3d24d916d0d793bf6.jpg',
                        title: 'อาจารย์ ธงรบ อักษร',
                        text: 'กรรมการประจําหลักสูตร',
                        actions: [
                            {
                                type: 'uri',
                                label: 'ดูเพิ่มเติม',
                                uri: 'https://itpsru.in.th/personal/',
                            },
                        ],
                    },
                    {
                        thumbnailImageUrl:
                            'https://www.img.in.th/images/1f8076745d1dd4b0c381ebca07c69be8.jpg',
                        title: 'ผู้ช่วยศาสตราจารย์ ภาวินี อินทร์ทอง',
                        text: 'กรรมการหลักสูตร',
                        actions: [
                            {
                                type: 'uri',
                                label: 'ดูเพิ่มเติม',
                                uri: 'https://itpsru.in.th/personal/',
                            },
                        ],
                    },
                ],
            },
        },
    ]
    client
        .replyMessage(replyToken, message)
        .then(() => {
            console.log(
                'Message has been reply to : %s  | Sent At : %d',
                userId,
                Date.now()
            )
        })
        .catch((err) => {
            console.error('Failed to reply message:', err)
        })
}
export const GetStudentGrade = async (studentId: number): Promise<void> => {
    const getGrade = await prisma.studentGrade.findMany({
        where: {
            studentId: studentId?.toString(),
        },
    })
    console.log(getGrade)
}
