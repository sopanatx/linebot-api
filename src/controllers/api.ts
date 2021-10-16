import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import { NextFunction, Request, Response } from 'express'
import axios from 'axios'
import * as shortid from 'shortid'
import * as bcrypt from 'bcryptjs'
import passport from 'passport'
import CryptoJS from 'crypto-js'
import * as line from '@line/bot-sdk'
import * as os from 'os'

const client = new line.Client({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
})

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
                    token: encryptedToken,
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

export const getAllMyClass = async (req: any, res: any): Promise<any> => {
    const { id } = req.body
    if (!req.cookies.token) {
        return res.status(401).json({
            code: 5001,
            status: 'error',
            message: 'Unauthorized',
        })
    }
    if (!id) {
        return res.status(400).json({
            code: 5002,
            status: 'error',
            message: 'Missing id in parameters',
        })
    }
    const getDecodeToken = await ValidationToken(req.cookies.token)
    if (getDecodeToken.isError) {
        return res.redirect('/admin/login')
    }

    const getEmail = getDecodeToken.email
    const getClass = await prisma.users.findFirst({
        where: {
            email: getEmail,
        },
        include: {
            Subject: true,
        },
    })
    return res.status(200).json({
        status: 'success',
        message: 'Get all my class',
        email: getEmail,
        data: getClass,
    })
}

export const sendMessage = async (req: any, res: any): Promise<any> => {
    const { studentId, message } = req.body

    console.log(message, studentId)
    if (!studentId || !message) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing id or message in parameters',
        })
    }

    try {
        const getStudent = await prisma.studentInfomation.findFirst({
            where: {
                studentId: studentId,
            },
        })

        if (!getStudent.isLoggedIn) {
            return res.status(500).json({
                status: 'failed',
                message: 'นักศึกษายังไม่ได้ล็อคอินกับ Line OA',
            })
        }

        client
            .pushMessage(getStudent.lineUserId, {
                type: 'text',
                text: message,
            })
            .then(() => {
                return res.status(200).json({
                    status: 'success',
                    message: 'Send message success',
                })
            })
            .catch((e) => {
                console.log(e.data)
                return res.status(500).json({
                    status: 'failed',
                    message: 'ส่งข้อความล้มเหลว',
                })
            })
    } catch {
        return res.status(500).json({
            status: 'failed',
            message: 'ส่งข้อความล้มเหลว',
        })
    }
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

export const AdminAddUser = async (req: any, res: any): Promise<any> => {
    if (!req.cookies.token) {
        return res.status(401).json({
            error_msg: 'ROLE_NOT_ACCEPTABLE',
            status: 'error',
            message: 'คุณไม่มีสิทธิ์เข้าถึงระบบนี้',
        })
    }
    let token = req.cookies.token
    const decrypted = CryptoJS.AES.decrypt(token, 'NW3mazd9Do7DQneaTFbiXxphJ')
    const decryptedData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))

    if (decryptedData.role != 'ADMIN') {
        return res.status(401).json({
            code: 5001,
            status: 'error',
            message: 'Unauthorized',
        })
    }

    const { email, password, fullname, role } = req.body
    if (!email || !password || !fullname || !role) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing email, password, fullname or role in parameters',
        })
    }
    //
    try {
        const user = await prisma.users.create({
            data: {
                fullname: fullname,
                email: email,
                password: await bcrypt.hash(password, 10),
                role: role,
            },
        })
        res.status(200).send({
            message: 'success',
            user: user,
        })
    } catch (e) {
        return res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        })
    }
}

export const getStudent = async (req: any, res: any): Promise<any> => {
    if (!req.cookies.token) {
        return res.status(401).json({
            error_msg: 'COOKIES_NOT_VALID',
            status: 'error',
            message: 'เซสซันหมดอายุ',
        })
    }
    let token = req.cookies.token
    const decrypted = CryptoJS.AES.decrypt(token, 'NW3mazd9Do7DQneaTFbiXxphJ')
    const decryptedData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))

    if (decryptedData.expired < Date.now()) {
        return res.status(401).json({
            code: 5001,
            status: 'error',
            message: 'Unauthorized',
        })
    }

    const { id } = req.body
    console.log(req.body)
    if (!id) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing id in parameters',
        })
    }
    const getStudent = await prisma.studentInfomation.findMany({
        include: {
            StudentGrade: {
                where: {
                    subjectId: id,
                },
                select: {
                    grade: true,
                    gradeType: true,
                },
            },
        },
    })

    res.status(200).json({
        getStudent,
    })
}

export const updateClass = async (req: any, res: any): Promise<any> => {
    if (!req.cookies.token) {
        return res.status(401).json({
            error_msg: 'UNAUTHORIZED',
            status: 'error',
            message: 'Unathorized',
        })
    }
    let token = req.cookies.token
    const decrypted = CryptoJS.AES.decrypt(token, 'NW3mazd9Do7DQneaTFbiXxphJ')
    const decryptedData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))

    if (decryptedData.expired < Date.now()) {
        return res.status(401).json({
            code: 5001,
            status: 'error',
            message: 'Unauthorized',
        })
    }

    const { id, subjectName } = req.body

    if (!id || !subjectName) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing id or subjectName in parameters',
        })
    }

    try {
        await prisma.subject.update({
            where: {
                id: id,
            },
            data: {
                subjectName: subjectName,
            },
        })
        res.status(200).json({
            status: 'success',
            message: 'ปรับปรุงข้อมูลสำเร็จ',
        })
    } catch (e) {
        return res.status(500).json({
            status: 'error',
            message: 'ข้อผิดพลาดระหว่างประมวลผล',
        })
    }
}

export const getServerInfo = async (req: any, res: any): Promise<any> => {
    if (!req.cookies.token) {
        return res.status(401).json({
            error_msg: 'UNAUTHORIZED',
            status: 'error',
            message: 'Unathorized',
        })
    }
    let token = req.cookies.token
    const decrypted = CryptoJS.AES.decrypt(token, 'NW3mazd9Do7DQneaTFbiXxphJ')
    const decryptedData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))

    if (decryptedData.expired < Date.now()) {
        return res.status(401).json({
            code: 1041,
            status: 'error',
            message: 'Session Expired',
        })
    }

    res.status(200).json({
        status: 'ok',
        hostname: os.hostname(),
        loadavg: os.loadavg(),
        freemem: os.freemem(),
        totalmem: os.totalmem(),
        uptime: os.uptime(),
        cpu: os.cpus(),
        platform: os.platform(),
        type: os.type(),
        version: os.version(),
    })
}
