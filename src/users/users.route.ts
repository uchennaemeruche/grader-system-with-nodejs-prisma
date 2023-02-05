import { Plugin, Server } from '@hapi/hapi'
import Joi from 'joi'
import { UserHandler } from './users.handler'

const userInputValidator = Joi.object({
    name: Joi.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional()
    }),
    email: Joi.string()
        .email()
        .alter({
            create: (schema) => schema.required(),
            update: (schema) => schema.optional()
        }),
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
                        payload: userInputValidator.tailor('create')
                    }
                }
            },
            {
                method: 'GET',
                path: '/users',
                handler: handler.getUsers
            },
            {
                method: 'GET',
                path: '/users/{userId}',
                handler: handler.getUser,
                options: {
                    validate: {
                        params: Joi.object({
                            userId: Joi.number().integer().required()
                        })
                    }
                }
            },
            {
                method: 'DELETE',
                path: '/users/{userId}',
                handler: handler.deleteUser,
                options: {
                    validate: {
                        params: Joi.object({
                            userId: Joi.number().integer().required()
                        })
                    }
                }
            },
            {
                method: 'PUT',
                path: '/users/{userId}',
                handler: handler.updateUser,
                options: {
                    validate: {
                        params: Joi.object({
                            userId: Joi.number().integer().required()
                        }),
                        payload: userInputValidator.tailor('update')
                    }
                }
            }
        ])
    }
}

export default usersPlugin
