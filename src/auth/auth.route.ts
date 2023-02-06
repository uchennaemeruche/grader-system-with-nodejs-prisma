import { Plugin, Server } from '@hapi/hapi'
import Joi from 'joi'
import { AuthHandler } from './auth.handler'

const handler = new AuthHandler()

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
    }
}
