import { Request, Response } from 'express'
import { middleware } from '@line/bot-sdk'
import * as line from '@line/bot-sdk'
import { GetContact } from '../service/messageService'
import { PrismaClient } from '@prisma/client'
import 'moment/locale/th'
import momentTZ from 'moment-timezone'
import { Console } from 'console'
import CryptoJS from 'crypto-js'
import * as os from 'os'
import { getAllMyClass } from './api'
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
    if (req.cookies.token) res.redirect('/admin/dashboard')
    const time = momentTZ().format('DD MMMM YYYY HH:MM')
    console.log(req.session)
    res.status(200).render('../views/admin/login.ejs', {
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
        res.clearCookie('connect.sid')
        res.clearCookie('token')
        res.clearCookie('loggedin')
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
        res.clearCookie('connect.sid')
        res.clearCookie('token')
        res.clearCookie('loggedin')
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
        isAdmin: getUser.role === 'ADMIN' ? true : false,
        roleName: getUser.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'อาจารย์',
        time: time,
    }

    res.render('../views/admin/main.ejs', { renderdata })
}

export const AdminManageSubject = async (
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

    const getUser = await prisma.users.findFirst({
        where: {
            email: getEmail,
        },
        include: {
            Subject: true,
        },
    })

    if (!getUser) {
        return res.redirect('/admin/login')
    }
    console.log(getUser)
    const renderdata = {
        fullname: getUser.fullname,
        Subject: getUser.Subject,
        isAdmin: getUser.role === 'ADMIN' ? true : false,
        roleName: getUser.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'อาจารย์',
    }

    res.render('../views/admin/manageClass.ejs', { renderdata })
}

export const AdminTeacherSendMessage = async (
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

    const getUser = await prisma.users.findFirst({
        where: {
            email: getEmail,
        },
        include: {
            Subject: {
                include: {
                    StudentGrade: {
                        include: {
                            Student: true,
                        },
                    },
                },
            },
        },
    })

    if (!getUser) {
        return res.redirect('/admin/login')
    }
    console.log(getUser)
    console.log(getUser.Subject[0].StudentGrade)

    const renderdata = {
        fullname: getUser.fullname,
        Subject: getUser.Subject,
        isAdmin: getUser.role === 'ADMIN' ? true : false,
        roleName: getUser.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'อาจารย์',
    }

    res.render('../views/admin/sendMessage.ejs', { renderdata })
}

export const AdminEditClass = async (
    req: Request,
    res: Response
): Promise<any> => {
    if (!req.cookies.token) {
        return res.redirect('/admin/login')
    }
    const { id } = req.query

    if (!id) return res.redirect('/admin/class')

    const getDecodeToken = await ValidationToken(req.cookies.token)
    if (getDecodeToken.isError) {
        return res.redirect('/admin/login')
    }

    const getEmail = getDecodeToken.email

    const getUser = await prisma.users.findFirst({
        where: {
            email: getEmail,
        },
    })

    const getSubject = await prisma.subject.findUnique({
        where: {
            id: id.toString(),
        },
    })

    console.log(getSubject)
    const renderdata = {
        fullname: getUser.fullname,
        getSubject,
        classId: id,
        isAdmin: getUser.role === 'ADMIN' ? true : false,
        roleName: getUser.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'อาจารย์',
    }

    res.render('../views/admin/editClass.ejs', { renderdata })
}

export const AdminLogout = async (
    req: Request,
    res: Response
): Promise<any> => {
    if (!req.cookies.token) {
        return res.redirect('/admin/login')
    }
    res.clearCookie('connect.sid')
    res.clearCookie('token')
    res.clearCookie('loggedin')
    return res.redirect('/admin/login')
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

export const getSystemStatus = async (
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

    const getUser = await prisma.users.findFirst({
        where: {
            email: getEmail,
        },
    })
    if (getUser.role !== 'ADMIN') {
        return res.redirect('/admin/dashboard')
    }
    const renderdata = {
        fullname: getUser.fullname,
        system: {
            cpu: os.cpus()[0].model,
            hostname: os.hostname(),
            platform: os.platform(),
            uptime: convertHMS(os.uptime()),
        },
        isAdmin: getUser.role === 'ADMIN' ? true : false,
        roleName: getUser.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'อาจารย์',
    }

    res.render('../views/admin/system.ejs', { renderdata })
}

function convertHMS(value: any) {
    const sec = parseInt(value, 10) // convert value to number if it's string
    let hours: any = Math.floor(sec / 3600) // get hours
    let minutes: any = Math.floor((sec - hours * 3600) / 60) // get minutes
    let seconds: any = sec - hours * 3600 - minutes * 60 //  get seconds
    // add 0 if value < 10; Example: 2 => 02
    if (hours < 10) {
        hours = '0' + hours
    }
    if (minutes < 10) {
        minutes = '0' + minutes
    }
    if (seconds < 10) {
        seconds = '0' + seconds
    }
    return hours + ':' + minutes + ':' + seconds // Return is HH : MM : SS
}
export const AdminAddUser = async (req: Request, res: Response) => {
    if (!req.cookies.token) {
        return res.redirect('/admin/login')
    }
    const getDecodeToken = await ValidationToken(req.cookies.token)
    if (getDecodeToken.isError) {
        return res.redirect('/admin/login')
    }

    const getEmail = getDecodeToken.email

    const getUser = await prisma.users.findFirst({
        where: {
            email: getEmail,
        },
    })

    if (getUser.role !== 'ADMIN') {
        return res.redirect('/admin/dashboard')
    }

    const renderdata = {
        fullname: getUser.fullname,
        isAdmin: getUser.role === 'ADMIN' ? true : false,
        roleName: getUser.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'อาจารย์',
    }

    res.render('../views/admin/adduser.ejs', { renderdata })
}

export const AdminManageUser = async (req: Request, res: Response) => {
    if (!req.cookies.token) {
        return res.redirect('/admin/login')
    }
    const getDecodeToken = await ValidationToken(req.cookies.token)
    if (getDecodeToken.isError) {
        return res.redirect('/admin/login')
    }

    const getEmail = getDecodeToken.email

    const getUser = await prisma.users.findFirst({
        where: {
            email: getEmail,
        },
    })

    if (getUser.role !== 'ADMIN') {
        return res.redirect('/admin/dashboard')
    }

    const getAllUser = await prisma.users.findMany({
        select: {
            id: true,
            fullname: true,
            email: true,
            role: true,
        },
    })
    const renderdata = {
        fullname: getUser.fullname,
        isAdmin: getUser.role === 'ADMIN' ? true : false,
        roleName: getUser.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'อาจารย์',
        getAllUser,
        version: process.env.APP_VERSION ? process.env.APP_VERSION : '1.0.0',
    }
    console.log(renderdata.getAllUser.length)
    res.render('../views/admin/user.ejs', { renderdata })
}

export const AdminAddStudent = async (req: Request, res: Response) => {
    if (!req.cookies.token) {
        return res.redirect('/admin/login')
    }
    const getDecodeToken = await ValidationToken(req.cookies.token)
    if (getDecodeToken.isError) {
        return res.redirect('/admin/login')
    }

    const getEmail = getDecodeToken.email

    const getUser = await prisma.users.findFirst({
        where: {
            email: getEmail,
        },
    })

    if (getUser.role !== 'ADMIN') {
        return res.redirect('/admin/dashboard')
    }

    const renderdata = {
        fullname: getUser.fullname,
        isAdmin: getUser.role === 'ADMIN' ? true : false,
        roleName: getUser.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'อาจารย์',
    }

    res.render('../views/admin/addstudent.ejs', { renderdata })
}

export const AdminManageStudent = async (req: Request, res: Response) => {
    if (!req.cookies.token) {
        return res.redirect('/admin/login')
    }
    const getDecodeToken = await ValidationToken(req.cookies.token)
    if (getDecodeToken.isError) {
        return res.redirect('/admin/login')
    }

    const getEmail = getDecodeToken.email

    const getUser = await prisma.users.findFirst({
        where: {
            email: getEmail,
        },
    })

    if (getUser.role !== 'ADMIN') {
        return res.redirect('/admin/dashboard')
    }

    const getAllStudent = await prisma.studentInfomation.findMany({})
    const renderdata = {
        fullname: getUser.fullname,
        isAdmin: getUser.role === 'ADMIN' ? true : false,
        roleName: getUser.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'อาจารย์',
        student: getAllStudent,
        version: process.env.APP_VERSION ? process.env.APP_VERSION : '1.0.0',
    }
    res.render('../views/admin/student.ejs', { renderdata })
}

export const AdminManageClass = async (req: Request, res: Response) => {
    if (!req.cookies.token) {
        return res.redirect('/admin/login')
    }
    const getDecodeToken = await ValidationToken(req.cookies.token)
    if (getDecodeToken.isError) {
        return res.redirect('/admin/login')
    }

    const getEmail = getDecodeToken.email

    const getUser = await prisma.users.findFirst({
        where: {
            email: getEmail,
        },
    })

    if (getUser.role !== 'ADMIN') {
        return res.redirect('/admin/dashboard')
    }

    const getAllClass = await prisma.subject.findMany({
        include: {
            Teacher: {
                select: {
                    fullname: true,
                },
            },
        },
    })
    const renderdata = {
        fullname: getUser.fullname,
        isAdmin: getUser.role === 'ADMIN' ? true : false,
        roleName: getUser.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'อาจารย์',
        class: getAllClass,
        version: process.env.APP_VERSION ? process.env.APP_VERSION : '1.0.0',
    }
    console.log(renderdata.class)
    res.render('../views/admin/class.ejs', { renderdata })
}
