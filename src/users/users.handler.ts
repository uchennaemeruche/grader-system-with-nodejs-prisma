import { badImplementation } from '@hapi/boom'
import { Request, ResponseToolkit } from '@hapi/hapi'

interface UserInput {
    name: string
    email: string
    social: {
        facebook?: string
        twitter?: string
        github?: string
        website?: string
    }
}
export class UserHandler {
    async createUser(req: Request, res: ResponseToolkit) {
        const { prisma } = req.server.app
        const payload = req.payload as UserInput
        try {
            const user = await prisma.user.create({
                data: payload,
                select: { id: true }
            })
            return res.response(user).code(201)
        } catch (error: any) {
            if (error.code === 'P2002') {
                console.log('Duplicate value')
                return res.response('Duplicate field').code(400)
            }
            return res.response(error.message).code(400)
        }
    }

    async getUsers(req: Request, res: ResponseToolkit) {
        const { prisma } = req.server.app
        try {
            const users = await prisma.user.findMany()
            return res.response(users).code(200)
        } catch (error) {
            console.log(error)
        }
    }
    async getUser(req: Request, res: ResponseToolkit) {
        const { prisma } = req.server.app
        const { userId } = req.params
        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                }
            })
            if (!user) return res.response().code(404)
            return res.response(user).code(200)
        } catch (error) {
            console.log(error)
            return badImplementation
        }
    }
    async deleteUser(req: Request, res: ResponseToolkit) {
        const { prisma } = req.server.app
        const userId = parseInt(req.params.userId, 10)

        try {
            await prisma.user.delete({
                where: {
                    id: userId
                }
            })
            return res.response().code(204)
        } catch (error) {
            console.log(error)
            return badImplementation
        }
    }
    async updateUser(req: Request, res: ResponseToolkit) {
        const { prisma } = req.server.app
        const userId = parseInt(req.params.userId, 10)
        const payload = req.payload as Partial<UserInput>

        try {
            const updatedUser = await prisma.user.update({
                where: {
                    id: userId
                },
                data: payload
            })
            return res.response(updatedUser).code(200)
        } catch (error: any) {
            if (error.code === 'P2025') return res.response().code(404)
            return res.response().code(500)
        }
    }
}
