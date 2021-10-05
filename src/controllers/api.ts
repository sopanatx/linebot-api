import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import { Request, Response } from 'express'
import { NotFound, Unauthorized } from 'http-errors'
import axios from 'axios'
export const ApiHello = async (req: Request, res: Response): Promise<void> => {
    res.status(200).send('Hello')
}
export const ApiAuth = async (req: Request, res: Response): Promise<void> => {
    console.log(req.headers)
    res.status(200).send('AUTH SERVICE')
}

export const ApiLiffId = async (req: Request, res: Response): Promise<void> => {
    const myLiffId = process.env.LINE_LIFF_ID || 'NULL_ID'
    res.json({
        id: myLiffId,
    })
}

export const GetStudentInfoByLineUserId = async (
    req: Request,
    res: Response
): Promise<void> => {
    res.json({
        data: {
            studentName: 'Test',
            lineId: 'test',
        },
    })
}

export const ApiLogin = async (req: Request, res: Response): Promise<void> => {
    let { idcard, accessToken } = req.body

    console.log(req.body)
    if (!accessToken || !idcard) {
        res.status(403).send({
            code: 3004,
            message: 'accesstoken must be passed in',
        })
    } else {
        console.log({ idcard, accessToken })

        let profile = await axios({
            method: 'post',
            url: 'https://api.line.me/v2/profile',
            headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${accessToken}`,
            },
        })
        console.log(profile.data['userId'])
        try {
            const getLogin = await prisma.studentInfomation.findUnique({
                where: {
                    idCard: idcard,
                },
                select: {
                    lineUserId: true,
                    firstname: true,
                    lastname: true,
                    studentId: true,
                    isLoggedIn: true,
                },
            })
            if (!getLogin) {
                res.status(403).send({
                    code: 3005,
                    message: 'Data not found!',
                })
            } else {
                const update = await prisma.studentInfomation.update({
                    where: {
                        idCard: idcard,
                    },
                    data: {
                        isLoggedIn: true,
                        lineUserId: profile.data['userId'],
                    },
                })
                res.json({
                    code: 7001,
                    message: 'Login Success',
                    data: {
                        studentName: update.firstname + ' ' + getLogin.lastname,
                        lineId: update.lineUserId,
                        studentId: update.studentId,
                    },
                })
            }
        } catch (e) {
            console.log(e)
            res.status(403).send({
                code: 3001,
                message: 'Unauthorized',
            })
        }
    }
}

export const ApiCheckLogin = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { lineaccesstoken } = req.body

    if (!lineaccesstoken) {
        res.status(403).send({
            code: 3002,
            message: 'accesstoken must be passed in.',
        })
    } else {
        try {
            let profile = await axios({
                method: 'post',
                url: 'https://api.line.me/v2/profile',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: `Bearer ${lineaccesstoken}`,
                },
            })
            const getLogin = await prisma.studentInfomation.findFirst({
                where: {
                    lineUserId: profile.data['userId'],
                },
                select: {
                    lineUserId: true,
                    firstname: true,
                    lastname: true,
                    studentId: true,
                    isLoggedIn: true,
                },
            })
            res.json({
                code: 7001,
                message: 'Login Success',
                data: {
                    studentName: getLogin.firstname + ' ' + getLogin.lastname,
                    lineId: getLogin.lineUserId,
                    studentId: getLogin.studentId,
                },
            })
        } catch {
            res.status(403).send({
                code: 3003,
                message: 'Unauthorized',
            })
        }
    }
}

export const getStudentInfo = async (
    req: Request,
    res: Response
): Promise<void> => {
    /*
    Error Code : 
    3010    - ไม่พบข้อมูลนักศึกษา
    3011    - ยังไม่ได้เข้าสู่ระบบ
    3012    - ข้อมูลนักศึกษาไม่ถูกต้อง
    3013    - access token ไม่ถูกต้อง
    3014    - ข้อผิดพลาดอื่นๆ
*/

    const { lineaccesstoken } = req.headers

    if (!lineaccesstoken) {
        res.status(404).send()
    }

    let profile = await axios({
        method: 'post',
        url: 'https://api.line.me/v2/profile',
        headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${lineaccesstoken}`,
        },
    })

    if (!profile.data) {
        res.send({
            code: 3014,
            message: 'access token ไม่ถูกต้อง',
        })
    }

    const getStudent = await prisma.studentInfomation.findUnique({
        where: {
            lineUserId: profile.data['userId'],
        },
        select: {
            firstname: true,
            lastname: true,
            studentId: true,
            isLoggedIn: true,
        },
    })

    if (!getStudent) {
        res.send({
            code: 3010,
            message: 'ไม่พบข้อมูลนักศึกษา / ยังไม่เคยเข้าสู่ระบบ',
        })
    }

    res.status(200).send(getStudent)
}
