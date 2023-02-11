import { Request, ResponseToolkit } from '@hapi/hapi'
import { CourseInput, CourseService } from './course.service'

export class CourseHandler {
    constructor(private courseService: CourseService) {}

    async create(req: Request, res: ResponseToolkit) {
        const payload = req.payload as CourseInput
        try {
            const result = await this.courseService.createCourse(payload)
            if (!result.success || !result.data) return res.response().code(400)

            return res.response(result.data).code(201)
        } catch (error: any) {
            return res.response(error.message).code(400)
        }
    }

    async getAll(req: Request, res: ResponseToolkit) {
        const { userId, isAdmin } = req.auth.credentials

        try {
            const result = await this.courseService.findCourses(isAdmin, userId)
            if (!result.success || !result.data) return res.response().code(400)
            return res.response(result.data).code(200)
        } catch (error: any) {
            console.log('ERROR', error)
            return res.response(error.message).code(400)
        }
    }
    async getOne(req: Request, res: ResponseToolkit) {
        const { courseId } = req.params

        try {
            const result = await this.courseService.findCourse(courseId)
            if (!result.success || !result.data) return res.response().code(400)
            return res.response(result.data).code(200)
        } catch (error: any) {
            return res.response(error.message).code(400)
        }
    }
}
