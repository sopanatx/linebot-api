import { Request, Response } from 'express'
import { middleware } from '@line/bot-sdk'
import * as line from '@line/bot-sdk'
import { GetContact } from '../service/messageService'
import { PrismaClient } from '@prisma/client'
import 'moment/locale/th'
import momentTZ from 'moment-timezone'
import { Console } from 'console'
import CryptoJS from 'crypto-js'
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
    console.log(req.session)
    res.render('../views/admin/login.ejs', {
        time,
        recaptcha_site: process.env.RECAPTCHA_SITE,
    })
}

export const AdminMainView = async (
    req: Request,
    res: Response
): Promise<any> => {
    if (!req.cookies.token) {
        return res.redirect('/admin/login')
    }
    const getDecodeToken = await ValidationToken(req.cookies.token)
    if (getDecodeToken.isError) {
        return res.redirect('/admin/login')
    }

    const getEmail = getDecodeToken.email

    let time = momentTZ().format('DD MMMM YYYY HH:MM')
    const getUser = await prisma.users.findFirst({
        where: {
            email: getEmail,
        },
    })

    if (!getUser) {
        return res.redirect('/admin/login')
    }
    const getStudentCount = await prisma.studentInfomation.count()
    const getStudent = await prisma.studentInfomation.findMany({
        where: {
            isLoggedIn: true,
        },
    })
    const getWaitingSendmessage = await prisma.messageAutoSend.count({
        where: {
            isSent: false,
        },
    })
    const getTotalMessage = await prisma.messageAutoSend.count()
    const getTotalAsking = await prisma.messageLog.count()
    const renderdata = {
        linelogin: getStudent.length,
        studentcount: getStudentCount,
        getWaitingSendmessage: getWaitingSendmessage,
        getTotalMessage: getTotalMessage,
        getTotalAsking: getTotalAsking,
        fullname: getUser.fullname,
        time: time,
    }

    res.render('../views/admin/main.ejs', { renderdata })
}

const ValidationToken = async (token: string): Promise<any> => {
    const decrypted = CryptoJS.AES.decrypt(token, 'NW3mazd9Do7DQneaTFbiXxphJ')
    const decryptedData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))
    try {
        if (decryptedData.expired < Date.now()) {
            return {
                message: 'expired',
                isError: true,
            }
        } else {
            return {
                message: 'success',
                isError: false,
                email: decryptedData.email,
            }
        }
    } catch {
        return {
            isError: true,
        }
    }
}
