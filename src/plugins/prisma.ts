import { Plugin, Server } from '@hapi/hapi'
import { PrismaClient } from '@prisma/client'

declare module '@hapi/hapi' {
    interface ServerApplicationState {
        prisma: PrismaClient
    }
}
export const prismaPlugin: Plugin<null> = {
    name: 'prisma',
    register: async function (server: Server) {
        const prisma = new PrismaClient()
        server.app.prisma = prisma

        server.ext({
            type: 'onPostStop',
            method: async (server: Server) => {
                server.app.prisma.$disconnect()
            }
        })
    }
}
