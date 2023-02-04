import { Server } from '@hapi/hapi'
import { AppServer } from './app'

describe('smoke test', () => {
    let server: Server

    beforeEach(async () => {
        server = await new AppServer(3000, 'localhost').createServer()
    })

    afterEach(async () => {
        await server.stop()
    })

    it('returns health check', async () => {
        const res = await server.inject({
            method: 'GET',
            url: '/'
        })
        expect(res.statusCode).toEqual(200)
        expect(res.result).toMatchObject({ up: true })
    })
})
