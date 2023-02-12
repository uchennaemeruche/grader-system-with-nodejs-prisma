import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const resetDB = async () => {
    await prisma.assessmentResult.deleteMany({})
    await prisma.courseEnrollment.deleteMany({})
    await prisma.assessment.deleteMany({})
    await prisma.token.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.course.deleteMany({})
}
;(async () => {
    await resetDB()
})()
