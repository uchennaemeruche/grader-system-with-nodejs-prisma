import { Plugin, Server } from '@hapi/hapi'
import Joi from 'joi'
import { AuthHandler } from './auth.handler'

const secret = process.env.JWT_SECRET || 'SUPER_SECRET_JWT_SECRET'
const handler = new AuthHandler(10, 12, 'HS256', secret)

export const authPlugin: Plugin<null> = {
    name: 'app/auth',
    dependencies: ['prisma', 'hapi-auth-jwt2', 'app/email'],
    register: async function (server: Server) {
        server.route({
            method: 'POST',
            path: '/auth/login',
            handler: handler.login,
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
            path: '/auth/authenticate',
            handler: handler.authenticate,
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
