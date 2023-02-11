import { Plugin, Request, ResponseToolkit, Server } from '@hapi/hapi'
import Joi from 'joi'
import { API_AUTH_STATEGY } from '../auth/auth.route'
import { CourseHandler } from './course.handler'
import { CourseService } from './course.service'

const CourseInputValidator = Joi.object({
    title: Joi.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional()
    }),
    details: Joi.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional()
    }),
    member: Joi.object().keys({
        role: Joi.string()
            .valid('STUDENT', 'TEACHER')
            .alter({
                create: (schema) => schema.required(),
                update: (schema) => schema.optional()
            }),
        email: Joi.string()
            .email()
            .alter({
                create: (schema) => schema.optional(),
                update: (schema) => schema.optional()
            })
    })
})
const coursePlugin: Plugin<null> = {
    name: 'app/course',
    register: async function (server: Server) {
        const service: CourseService = new CourseService(server.app.prisma)
        const handler = new CourseHandler(service)
        server.route([
            {
                method: 'POST',
                path: '/courses',
                handler: (req: Request, res: ResponseToolkit) =>
                    handler.create(req, res),
                options: {
                    validate: {
                        payload: CourseInputValidator.tailor('create')
                    }
                }
            },
            {
                method: 'GET',
                path: '/courses',
                handler: (req: Request, res: ResponseToolkit) =>
                    handler.getAll(req, res),
                options: {
                    auth: {
                        strategy: API_AUTH_STATEGY,
                        mode: 'required'
                    }
                }
            },
            {
                method: 'GET',
                path: '/courses/{courseId}',
                handler: (req: Request, res: ResponseToolkit) =>
                    handler.getOne(req, res),
                options: {
                    validate: {
                        params: Joi.object().keys({
                            courseId: Joi.number().required()
                        })
                    }
                }
            },
            {
                method: 'PUT',
                path: '/courses/{courseId}',
                handler: (req: Request, res: ResponseToolkit) =>
                    handler.update(req, res),
                options: {
                    validate: {
                        params: Joi.object().keys({
                            courseId: Joi.number().required()
                        }),
                        payload: CourseInputValidator.tailor('update')
                    }
                }
            }
        ])
    }
}

export default coursePlugin
