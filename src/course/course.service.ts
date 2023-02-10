import { PrismaClient } from '@prisma/client'

export class CourseService {
    constructor(private prisma: PrismaClient) {}

    findCourseEnrollment = async (filter: object) => {
        const courseTeacher = await this.prisma.courseEnrollment.findMany({
            where: filter,
            select: {
                courseId: true
            }
        })
        if (!courseTeacher) {
            return { success: false, error: new Error('token not found') }
        }
        return { success: true, courseTeacher }
    }
}
