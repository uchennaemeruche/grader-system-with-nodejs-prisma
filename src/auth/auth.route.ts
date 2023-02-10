import { Plugin, Request, ResponseToolkit, Server } from '@hapi/hapi'
import Joi from 'joi'
import { AuthHandler } from './auth.handler'
import { TokenService } from './token.service'

const secret = process.env.JWT_SECRET || 'SUPER_SECRET_JWT_SECRET'

export const authPlugin: Plugin<null> = {
    name: 'app/auth',
    dependencies: ['prisma', 'hapi-auth-jwt2', 'app/email'],
    register: async function (server: Server) {
        const service: TokenService = new TokenService(server.app.prisma)
        const handler = new AuthHandler(service, 10, 12, 'HS256', secret)
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
