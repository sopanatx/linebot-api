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
export const AdminLoginView = async (
    req: Request,
    res: Response
): Promise<void> => {
    const time = momentTZ().format('DD MMMM YYYY HH:MM')
    res.render('../views/admin/login.ejs', {
        time,
        recaptcha_site: process.env.RECAPTCHA_SITE,
    })
}
