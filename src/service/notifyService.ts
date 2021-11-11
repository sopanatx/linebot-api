import * as line from '@line/bot-sdk'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export async function checkPublish() {
    const publish = await prisma.systemConfig.findFirst()
    if (publish.isPublished == true) {
        console.log(
            '[TASK] : --> ระบบได้ส่งข้อมูลผลการเรียนประจำภาคเรียนไปแล้ว.'
        )
        return
    } else {
        console.log(
            '[TASK] : --> ยังไม่ได้ส่งผลการเรียน กำลังตรวจสอบเวลาที่ประกาศ'
        )
        if (publish.timeToPublish <= new Date()) {
            console.log('[TASK] : --> กำลังทำงาน และ เริ่มประกาศผล')
            const getStudent = await prisma.studentGrade.findMany({
                where: {
                    grade: 'F',
                },
            })
            console.log(getStudent)
            return
        } else {
            console.log('[TASK] : --> ยังไม่ถึงเวลาที่ประกาศ')
            return
        }
    }
}

export const getTime = async (): Promise<Date> => {
    const publish = await prisma.systemConfig.findFirst()
    return publish.timeToPublish
}
