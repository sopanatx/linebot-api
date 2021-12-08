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
import { ConvertNumberToGrade } from '../utils/converter'
import { ConvertNumberToNumberGrade } from '../utils/converter'

/*
    Error Code : 
    3010    - ไม่พบข้อมูลนักศึกษา
    3011    - ยังไม่ได้เข้าสู่ระบบ
    3012    - ข้อมูลนักศึกษาไม่ถูกต้อง
    3013    - access token ไม่ถูกต้อง
    3014    - ข้อผิดพลาดอื่นๆ



    5001 - Unauthorized
    5002 - Forbidden
    5003 - Not Found
    5004 - Internal Server Error
    5005 - Bad Request
    5006 - Unprocessable Entity
    5007 - Conflict 



    8001 - Invalid Signature
    8002 - Invalid Token


    4001 - คะแนนไม่สามารถมากกว่า 100 ได้
    4002 - คะแนนไม่สามารถน้อยกว่า 0 ได้
    4003 - คะแนนไม่สามารถเป็นค่าว่างได้
    4004 - เกรดเฉลี่ย ต้องอยู่ในรูปแบบ 0.00 - 4.00
    4005 - เกรดต้องอยู่ในรูปแบบ A, B+, B, C+, C, D+, D, F,I

    2001 - ส่งผลการเรียนประจำปี ไม่สำเร็จ
    2002 - ส่งผลการเรียนประจำปี สำเร็จ
    2003 - ######
*/

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

                await prisma.users.update({
                    where: {
                        id: getUser.id,
                    },
                    data: {
                        lastLogin: new Date(),
                    },
                })
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

    const getUser = await prisma.users.findFirst({
        where: {
            email: decryptedData.email,
        },
    })

    if (getUser.role != 'ADMIN') {
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
    const isExist = await prisma.users.findFirst({
        where: {
            email: email,
        },
    })
    if (isExist) {
        return res.status(409).json({
            status: 'error',
            message: 'มีอีเมลนี้ซ้ำอยู่แล้วในระบบ',
        })
    }

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

export const getUser = async (req: any, res: any): Promise<any> => {
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

    const getUser = await prisma.users.findFirst({
        where: {
            email: decryptedData.email,
        },
    })

    if (getUser.role != 'ADMIN') {
        return res.status(401).json({
            code: 5001,
            status: 'error',
            message: 'Unauthorized',
        })
    }

    const getAllUser = await prisma.users.findMany({
        select: {
            id: true,
            fullname: true,
            email: true,
            role: true,
        },
    })

    res.status(200).json({
        getAllUser,
    })
}
export const addStudent = async (req: any, res: any): Promise<any> => {
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

    const { studentId, idcard, firstname, lastname } = req.body
    if (!studentId || !idcard || !firstname || !lastname) {
        return res.status(400).json({
            status: 'error',
            message:
                'Missing studentId, idcard, firstname, lastname in parameters',
        })
    }

    const getStudent = await prisma.studentInfomation.findMany({
        where: {
            OR: [
                {
                    idCard: idcard.toString(),
                    studentId: studentId.toString(),
                },
            ],
        },
    })

    if (getStudent.length >= 1) {
        return res.status(409).json({
            status: 'error',
            message: 'มีข้อมูลนักเรียนนี้แล้ว',
        })
    }

    try {
        const create = await prisma.studentInfomation.create({
            data: {
                studentId: studentId,
                idCard: String(idcard),
                firstname: firstname,
                lastname: lastname,
            },
        })

        return res.status(200).json({
            status: 'success',
            message: 'สร้างข้อมูลนักเรียนสำเร็จ',
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            status: 'error',
            message: 'ข้อผิดพลาดระหว่างประมวลผล',
        })
    }
}

export const addClass = async (req: any, res: any): Promise<any> => {
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

    const { classId, className, teacherId, semester } = req.body
    if (!classId || !className || !teacherId || !semester) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing classId or className in parameters',
        })
    }

    const getClass = await prisma.subject.findMany({
        where: {
            subjectId: classId,
        },
    })
    if (getClass) {
        return res.status(409).json({
            status: 'error',
            message: 'รหัสวิชานี้ซ้ำในระบบแล้ว ',
        })
    }

    try {
        const create = await prisma.subject.create({
            data: {
                subjectId: String(classId),
                subjectName: className,
                teacherId: teacherId,
                semester: semester,
            },
        })

        return res.status(200).json({
            status: 'success',
            message: 'สร้างข้อมูลรายวิชาสำเร็จ',
        })
    } catch {
        return res.status(500).json({
            status: 'error',
            message: 'ข้อผิดพลาดระหว่างประมวลผล',
        })
    }
}

export const AddStudentToClass = async (req: any, res: any): Promise<any> => {
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

    const { studentId, classId } = req.body
    if (!studentId || !classId) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing studentId or classId in parameters',
        })
    }

    const getStudent = await prisma.studentInfomation.findUnique({
        where: {
            studentId: studentId,
        },
    })

    if (!getStudent) {
        return res.status(404).json({
            status: 'error',
            message: 'ไม่พบข้อมูลนักเรียนนี้',
        })
    }

    const getClass = await prisma.subject.findMany({
        where: {
            subjectId: classId,
        },
    })

    if (!getClass) {
        return res.status(404).json({
            status: 'error',
            message: 'ไม่พบข้อมูลรายวิชานี้',
        })
    }

    const getStudentInClass = await prisma.studentGrade.findMany({
        where: {
            subjectId: classId,
            studentId: studentId,
        },
    })

    if (getStudentInClass.length >= 1) {
        return res.status(409).json({
            status: 'error',
            message: 'มีข้อมูลนักเรียนนี้แล้วในรายวิชานี้',
        })
    }
    try {
        const create = await prisma.studentGrade.create({
            data: {
                studentId: studentId,
                subjectId: classId,
                grade: '',
            },
        })
        return res.status(200).json({
            status: 'success',
            message: 'สร้างข้อมูลนักเรียนเข้าร่วมรายวิชาสำเร็จ',
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: 'error',
            message: 'ข้อผิดพลาดระหว่างประมวลผล',
        })
    }
}

export const updateStudentGrade = async (
    req: Request,
    res: Response
): Promise<any> => {
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

    const { id, point, subjectId } = req.body

    if (!id) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing id in parameters',
        })
    }

    try {
        const update = await prisma.studentGrade.updateMany({
            where: {
                subjectId: subjectId,
                studentId: id,
            },
            data: {
                grade: ConvertNumberToNumberGrade(point),
                gradeType: ConvertNumberToGrade(point),
            },
        })
        return res.status(200).json({
            status: 'success',
            message: 'อัพเดทข้อมูลสำเร็จ',
            update,
        })
    } catch {
        return res.status(500).json({
            status: 'error',
            message: 'ปรับปรุงข้อมูลไม่สำเร็จ / ข้อผิดพลาดในการประมวลผล。',
        })
    }

    30
}

export const getMyAccountInfo = async (req: any, res: any): Promise<any> => {
    if (!req.cookies.token) {
        return res.status(401).json({
            error_msg: 'UNAUTHORIZED',
            status: 'error',
            message: 'ไม่ได้รับอนุญาตเข้าถึง',
        })
    }

    let token = req.cookies.token
    const decrypted = CryptoJS.AES.decrypt(token, 'NW3mazd9Do7DQneaTFbiXxphJ')
    const decryptedData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))

    if (decryptedData.expired < Date.now()) {
        return res.status(401).json({
            code: 5001,
            status: 'error',
            message: 'เซสชันหมดอายุ โปรดเข้าสู่ระบบใหม่อีกครั้ง',
        })
    }

    const getAccount = await prisma.users.findFirst({
        where: {
            email: decryptedData.email,
        },
        select: {
            fullname: true,
            email: true,
            role: true,
            lastLogin: true,
        },
    })
    if (!getAccount) {
        return res.status(404).json({
            status: 'error',
            message: 'ไม่พบข้อมูล',
        })
    }

    return res.status(200).json({
        status: 'OK',
        requestTime: new Date().toLocaleString(),
        getAccount,
    })
}

export const updateMyAccountInfo = async (req: any, res: any): Promise<any> => {
    if (!req.cookies.token) {
        return res.status(401).json({
            error_msg: 'UNAUTHORIZED',
            status: 'error',
            message: 'ไม่ได้รับอนุญาตเข้าถึง',
        })
    }

    let token = req.cookies.token
    const decrypted = CryptoJS.AES.decrypt(token, 'NW3mazd9Do7DQneaTFbiXxphJ')
    const decryptedData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))

    if (decryptedData.expired < Date.now()) {
        return res.status(401).json({
            code: 5001,
            status: 'error',
            message: 'เซสซันหมดอายุ',
        })
    }

    const { fullname, email, password } = req.body
    if (!fullname || !email || !password) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing fullname, email or password in parameters',
        })
    }

    const getAccount = await prisma.users.findFirst({
        where: {
            email: decryptedData.email,
        },
    })
    if (!getAccount) {
        return res.status(404).json({
            status: 'error',
            message: 'ไม่พบข้อมูล',
        })
    }

    try {
        const update = await prisma.users.update({
            where: {
                id: getAccount.id,
            },
            data: {
                fullname: fullname,
                email: email,
                password: password,
            },
        })
        return res.status(200).json({
            status: 'success',
            message: 'ปรับปรุงข้อมูลสำเร็จ',
        })
    } catch {
        return res.status(500).json({
            status: 'error',
            message: 'เกิดข้อผิดพลาดระหว่างประมวลผล',
        })
    }
}

export const AdminUpdateAccount = async (req: any, res: any): Promise<any> => {
    if (!req.cookies.token) {
        return res.status(401).json({
            error_msg: 'UNAUTHORIZED',
            status: 'error',
            message: 'ไม่ได้รับอนุญาตเข้าถึง',
        })
    }

    let token = req.cookies.token
    const decrypted = CryptoJS.AES.decrypt(token, 'NW3mazd9Do7DQneaTFbiXxphJ')
    const decryptedData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))

    if (decryptedData.expired < Date.now()) {
        return res.status(401).json({
            code: 5001,
            status: 'error',
            message: 'เซสซันหมดอายุ โปรดเข้าสู่ระบบใหม่อีกครั้ง',
        })
    }

    const { id, fullname, email, password } = req.body

    if (!id || !fullname || !email || !password) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing fullname, email or password in parameters',
        })
    }

    const getAccount = await prisma.users.findFirst({
        where: {
            id: id,
        },
    })

    if (!getAccount) {
        return res.status(404).json({
            status: 'error',
            message: 'ไม่พบข้อมูลในฐานข้อมูล',
        })
    }

    try {
        const update = await prisma.users.update({
            where: {
                id: getAccount.id,
            },
            data: {
                fullname: fullname,
                email: email,
                password: password,
            },
        })
        return res.status(200).json({
            status: 'success',
            message: 'ปรับปรุงข้อมูลสำเร็จ',
        })
    } catch {
        return res.status(500).json({
            status: 'error',
            message: 'ปรับปรุงข้อมูลไม่สำเร็จ / ข้อผิดพลาดในการประมวลผล',
        })
    }
}
