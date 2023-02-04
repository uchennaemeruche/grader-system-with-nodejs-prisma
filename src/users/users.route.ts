import { Plugin, Server } from '@hapi/hapi'
import Joi from 'joi'
import { UserHandler } from './users.handler'

const userInputValidator = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    social: Joi.object({
        facebook: Joi.string().optional(),
        twitter: Joi.string().optional(),
        github: Joi.string().optional(),
        website: Joi.string().optional()
    }).optional()
})

const handler = new UserHandler()
const usersPlugin: Plugin<null> = {
    name: 'app/users',
    register: async function (server: Server) {
        server.route([
            {
                method: 'POST',
                path: '/users',
                handler: handler.createUser,
                options: {
                    validate: {
                        payload: userInputValidator
                    }
                }
            },
            {
                method: 'GET',
                path: '/users',
                handler: handler.getUsers
            }
        ])
    }
}

export default usersPlugin
