import { Plugin, Request, ResponseToolkit, Server } from '@hapi/hapi'
import Joi from 'joi'
import { CourseService } from '../course/course.service'
import { AuthHandler } from './auth.handler'
import { TokenService } from './token.service'

const secret = process.env.JWT_SECRET || 'SUPER_SECRET_JWT_SECRET'
const JWT_ALGORITHM = 'HS256'

export const API_AUTH_STATEGY = 'API'

declare module '@hapi/hapi' {
    interface AuthCredentials {
        userId: number
        tokenId: number
        isAdmin: boolean
        teacherOf: number[]
    }
}
const authPlugin: Plugin<null> = {
    name: 'app/auth',
    dependencies: ['prisma', 'hapi-auth-jwt2', 'app/email'],
    register: async function (server: Server) {
        const tokenService: TokenService = new TokenService(server.app.prisma)
        const courseService = new CourseService(server.app.prisma)
        const handler = new AuthHandler(
            tokenService,
            courseService,
            10,
            12,
            JWT_ALGORITHM,
            secret
        )

        server.auth.strategy(API_AUTH_STATEGY, 'jwt', {
            key: secret,
            verifyOptions: { algorithms: [JWT_ALGORITHM] },
            validate: handler.validateApiToken
        })

        // Set the default API strategy for API routes, unless explicity disabled.
        server.auth.default(API_AUTH_STATEGY)

        server.route({
            method: 'POST',
            path: '/auth/login',
            handler: (req: Request, res: ResponseToolkit) =>
                handler.login(req, res),
            options: {
                auth: false,
                validate: {
                    payload: Joi.object({
                        email: Joi.string().email().required()
                    })
                }
            }
        })
        server.route({
            method: 'POST',
            path: '/auth/tokenticate',
            handler: (req: Request, res: ResponseToolkit) =>
                handler.authenticateToken(req, res),
            options: {
                auth: false,
                validate: {
                    payload: Joi.object({
                        email: Joi.string().email().required(),
                        emailToken: Joi.string().required()
                    })
                }
            }
        })
    }
}
export default authPlugin
