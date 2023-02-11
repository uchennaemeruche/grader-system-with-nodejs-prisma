import Hapi, { Server } from '@hapi/hapi'
import hapiAuthJwt from 'hapi-auth-jwt2'
import authPlugin from '../auth/auth.route'
import { emailPlugin } from '../plugins/email'
import { prismaPlugin } from '../plugins/prisma'
import usersPlugin from '../users/users.route'

export class AppServer {
    private server: Server
    constructor(port: number, host: string) {
        this.server = Hapi.server({ port, host })
        this.initRoutes()
    }

    private async initRoutes() {
        this.server.route({
            method: 'GET',
            path: '/',
            handler: (_, h) => {
                return h.response({ up: true }).code(200)
            },
            options: {
                auth: false
            }
        })
    }

    public async createServer() {
        await this.server.register([
            prismaPlugin,
            usersPlugin,
            emailPlugin,
            hapiAuthJwt,
            authPlugin
        ])
        await this.server.initialize()

        return this.server
    }

    public async start(server: Server) {
        server.start()
        console.log(
            `App Listening on ${server.settings.host}:${server.settings.port}`
        )

        process.on('unhandledRejection', (err) => {
            console.error('unhandledRejection')
            console.error(err)
            process.exit(1)
        })
    }
}
