import { PrismaClient, UserRole } from '@prisma/client'

export interface CourseInput {
    title: string
    details: string
    member: {
        role: UserRole
        email?: string
        id?: number
    }
}

export type CourseResponseObject = {
    id: number
    title: string
    courseDetails: string | null
    members?: { role: string; userId: number }[]
}

interface CourseResponse {
    success: boolean
    data?: CourseResponseObject | CourseResponseObject[]
    error?: string
}
export class CourseService {
    constructor(private prisma: PrismaClient) {}

    createCourse = async (data: CourseInput): Promise<CourseResponse> => {
        const course = await this.prisma.course.create({
            data: {
                title: data.title,
                courseDetails: data.details,

                members: !data.member
                    ? {}
                    : {
                          create: {
                              role: data?.member?.role,
                              user: {
                                  connect: {
                                      id: data.member.id ?? data.member.id,
                                      email:
                                          data.member.email ?? data.member.email
                                  }
                              }
                          }
                      }
            }
        })
        if (!course)
            return { success: false, error: 'Could not create new course' }
        return { success: true, data: course }
    }
    updateCourse = async (
        courseId: number,
        data: CourseInput
    ): Promise<CourseResponse> => {
        const course = await this.prisma.course.update({
            data: {
                title: data.title,
                courseDetails: data.details,
                members: {
                    create: {
                        role: data.member.role,
                        user: {
                            connect: {
                                id: data.member.id ?? data.member.id,
                                email: data.member.email ?? data.member.email
                            }
                        }
                    }
                }
            },
            where: {
                id: courseId
            }
        })
        if (!course)
            return { success: false, error: 'Could not create new course' }
        return { success: true, data: course }
    }

    findCourse = async (courseId: number): Promise<CourseResponse> => {
        const course = await this.prisma.course.findUnique({
            where: {
                id: courseId
            }
        })
        if (!course)
            return { success: false, error: 'Could not create new course' }
        return { success: true, data: course }
    }

    findCourses = async (
        isAdmin: boolean,
        userId: number
    ): Promise<CourseResponse> => {
        const courses = await this.prisma.course.findMany({
            where: isAdmin
                ? {}
                : {
                      members: {
                          some: {
                              userId
                          }
                      }
                  },
            select: {
                id: true,
                title: true,
                courseDetails: true,
                members: {
                    where: isAdmin ? {} : { userId },
                    select: {
                        role: true,
                        userId: true
                    }
                }
            }
        })
        if (!courses)
            return { success: false, error: 'Could not create new course' }
        return { success: true, data: courses }
    }

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
