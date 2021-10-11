import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import { NextFunction, Request, Response } from 'express'
import axios from 'axios'
import * as shortid from 'shortid'
import * as bcrypt from 'bcryptjs'
import passport from 'passport'
import CryptoJS from 'crypto-js'
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

export const authAdmin = async (req: any, res: any): Promise<any> => {
    let sess

    console.log({ sess })
    passport.authenticate('local')
    const { username, password, recaptcha_response } = req.body
    if (!username || !password || !recaptcha_response) {
        return res.status(401).json({
            status: 'error',
            message: 'username / password must be passed in.',
        })
    }

    let validate = await axios({
        method: 'post',
        url: 'https://www.google.com/recaptcha/api/siteverify',
        params: {
            secret: process.env.RECAPTCHA_SECRET,
            response: recaptcha_response,
        },
    })
    if (validate.data.success == false) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid recaptcha token',
        })
    }

    const getUser = await prisma.users.findFirst({
        where: {
            email: username,
        },
        select: {
            id: true,
            password: true,
            fullname: true,
            email: true,
            role: true,
        },
    })
    if (!getUser) {
        return res.status(404).json({
            status: 'error',
            message: 'ไม่มีพบข้อมูล user นี้ในระบบ',
        })
    }
    let options = {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true, // The cookie only accessible by the web server
        signed: false,
    }
    await bcrypt.compare(password, getUser.password).then(async (result) => {
        if (result) {
            if (getUser.role == 'ADMIN') {
                // let sess = req.session;
                // sess.user = getUser.id;
                //   req.session.logedin = true;
                res.setHeader('WWW-Authenticate', 'Basic')
                res.cookie('loggedin', 'true')
                const token = {
                    email: getUser.email,
                    expired: Date.now() + 3600000,
                }
                const encryptedToken = await CryptoJS.AES.encrypt(
                    JSON.stringify(token),
                    'NW3mazd9Do7DQneaTFbiXxphJ'
                ).toString()
                res.cookie('token', encryptedToken, options)
                //res.user = email;

                passport.authenticate('local', { successFlash: 'Welcome!' })
                return res.status(200).json({
                    status: 'success',
                    message: 'Login Success',
                    name: getUser.fullname,
                })
                //sessions.setSession(req, getUser.id);
            } else {
                return res.status(401).json({
                    status: 'error',
                    message: 'You are not admin',
                })
            }
            0
        } else {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid username or password',
            })
        }
    })
    // res.status(200).send({
    //     message: 'success',
    //     name: 'กรินทร์ สุขสวัสดิ์',
    // })
}

export const GenerateTestUser = async (req: any, res: any): Promise<any> => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(400).json({
            status: 'error',
            message: 'Unauthorized',
        })
    }
    let genEmail = shortid.generate() + '@testmail.com'
    let genPassword = shortid.generate()
    try {
        const user = await prisma.users.create({
            data: {
                fullname: 'Test',
                email: genEmail,
                password: await bcrypt.hash(genPassword, 10),
                role: 'ADMIN',
            },
        })
        res.status(200).send({
            message: 'success',
            user: user,
            raw: {
                email: genEmail,
                password: genPassword,
            },
        })
    } catch (e) {
        return res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        })
    }
}

export const DecryptToken = async (req: any, res: any): Promise<any> => {
    const { token } = req.body
    if (!token) {
        return res.status(400).json({
            status: 'error',
            message: 'token must be passed in.',
        })
    }
    //
    try {
        const decrypted = CryptoJS.AES.decrypt(
            token,
            'NW3mazd9Do7DQneaTFbiXxphJ'
        )
        const decryptedData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))
        if (decryptedData.expired < Date.now()) {
            return res.status(400).json({
                status: 'error',
                message: 'token expired',
            })
        }
        res.status(200).send({
            message: 'success',
            data: decryptedData,
        })
    } catch {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid token',
        })
    }
}

export const ExportBackup = async (
    req: Request,
    res: Response
): Promise<Response> => {
    return res.status(400).send({
        message: 'Bad Request',
        data: 'ยังไม่พร้อมใช้งาน',
    })
}
