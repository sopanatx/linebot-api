import { Request, Response } from 'express'
import { middleware } from '@line/bot-sdk'
import * as line from '@line/bot-sdk'
import { GetContact } from '../service/messageService'
import { PrismaClient } from '@prisma/client'
import 'moment/locale/th'
import momentTZ from 'moment-timezone'
momentTZ.locale('th-th')
momentTZ.tz.setDefault('Asia/Bangkok')

const prisma = new PrismaClient()
/**
 * GET /
 * Home page.
 */
const client = new line.Client({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
})

export const index = async (req: Request, res: Response): Promise<void> => {
    res.status(404).send()
}

export const webhook = async (req: Request, res: Response): Promise<void> => {
    if (!req.body) {
        res.send('ok')
    }
    const userMessage = req.body.events[0].message.text
    const userId = req.body.events[0].source.userId
    const replyToken = req.body.events[0].replyToken
    console.log(
        'received message : %s from id : %s | Received at: %d',
        userMessage,
        userId,
        Date.now()
    )
    console.log(req.body.events[0])
    switch (userMessage) {
        case 'ติดต่อสาขาวิชา':
            await prisma.messageLog.create({
                data: {
                    userId: userId,
                    message: userMessage,
                    isCorrect: true,
                },
            })
            return await GetContact(userId, userMessage, replyToken)
            break
        default:
            // await prisma.messageLog.create({
            //     data: {
            //         userId: userId,
            //         message: userMessage,
            //         isCorrect: false,
            //     },
            // });
            res.send({
                status: 'ok',
            })
            break
    }
}
export const Callback = async (req: Request, res: Response): Promise<void> => {
    console.log(req.headers)
    res.status(200).send('CALLBACK')
}

// Rendering liff apps page to user
export const liffApps = async (req: Request, res: Response): Promise<void> => {
    const myLiffId = process.env.LINE_LIFF_ID || 'NULL_ID'
    console.log('CLIENT: %s', req.headers['x-requested-with'])
    console.log('CONNECTION IP : %s', req.headers['cf-connecting-ip'])
    //console.log(req);

    const time = momentTZ().format('DD MMMM YYYY HH:MM')
    if (
        !req.headers['x-requested-with'] &&
        process.env.NODE_ENV === 'production'
    ) {
        console.info('Reject render from external browser.')
        res.status(404).send()
    } else {
        console.info('Rendering to Line Client Browser')
        res.render('../views/liff-index.ejs', { time })
    }
}
export const LoginView = async (req: Request, res: Response): Promise<void> => {
    const time = momentTZ().format('DD MMMM YYYY HH:MM')
    res.render('../views/login.ejs', { time })
}
