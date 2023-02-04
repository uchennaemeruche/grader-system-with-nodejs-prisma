import { Server } from '@hapi/hapi'
import { AppServer } from '../server/app'

describe('Users - Create User', () => {
    let server: Server

    beforeAll(async () => {
        server = await new AppServer(3000, 'localhost').createServer()
    })

    afterAll(async () => {
        await server.stop()
    })

    test('create a user', async () => {
        const response = await server.inject({
            method: 'POST',
            url: '/users',
            payload: {
                name: 'test--name',
                email: `test-${Date.now()}@example.io`,
                social: {
                    twitter: 'giveittojest'
                }
            }
        })

        expect(response.statusCode).toEqual(201)
    })
})
