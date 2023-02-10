import { Server } from '@hapi/hapi'
import { AppServer } from '../server/app'

describe('Users Test', () => {
    let server: Server
    beforeAll(async () => {
        server = await new AppServer(3000, 'localhost').createServer()
    })

    afterAll(async () => {
        await server.stop()
    })
    let userId: number
    describe('Create User', () => {
        it('creates a user and returns 201', async () => {
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
            userId = JSON.parse(response.payload)?.id
            expect(response.statusCode).toEqual(201)
            expect(response.result).toHaveProperty('id')
            expect(
                typeof JSON.parse(response.payload)?.id === 'number'
            ).toBeTruthy()
        })
        it('returns an error for an incomplete input payload', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/users',
                payload: {
                    email: `test-${Date.now()}@example.io`,
                    social: {
                        twitter: 'giveittojest'
                    }
                }
            })
            expect(response.statusCode).toEqual(400)
            expect(response.result).toHaveProperty('error')
            expect(response.result).toHaveProperty('message')
        })
    })

    describe('Get Users', () => {
        it('Returns a list of created users', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/users'
            })

            const result = response.result as Array<object>

            expect(response.statusCode).toEqual(200)
            expect(Array.isArray(['response.result'])).toBe(true)
            expect(result.length).toBeGreaterThanOrEqual(1)
            expect(result[0]).toMatchSnapshot({
                id: expect.any(Number),
                email: expect.any(String),
                name: expect.any(String),
                social: expect.any(Object),
                isAdmin: expect.any(Boolean)
            })
        })
        it('Returns a single user given a user ID', async () => {
            const response = await server.inject({
                method: 'GET',
                url: `/users/${userId}`
            })

            expect(response.statusCode).toEqual(200)
            console.log(response.result)
            expect(response.result).toMatchSnapshot({
                id: expect.any(Number),
                email: expect.any(String),
                name: expect.any(String),
                social: expect.any(Object),
                isAdmin: expect.any(Boolean)
            })
        })
        it('Returns 404 for a wrong or non-existing user', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/users/1000'
            })

            expect(response.statusCode).toEqual(404)
        })
        it('Returns a 400 validation error for an invalid param', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/users/aaksllss'
            })
            expect(response.statusCode).toEqual(400)
            expect(response.result).toHaveProperty('error')
        })
    })
    describe('Update User', () => {
        it('fails and returns 400 error given an invalid userId parameter', async () => {
            const response = await server.inject({
                method: 'PUT',
                url: `/users/jfjjkdkd`
            })
            expect(response.statusCode).toEqual(400)
        })
        it('returns 404 for non-existing userId', async () => {
            const response = await server.inject({
                method: 'PUT',
                url: `/users/1`
            })
            expect(response.statusCode).toEqual(400)
        })
        it('updates a user given an ID', async () => {
            const updatedName = 'Uchechukwu Emeruche'
            const response = await server.inject({
                method: 'PUT',
                url: `/users/${userId}`,
                payload: {
                    name: updatedName
                }
            })
            expect(response.statusCode).toEqual(200)
            const user = JSON.parse(response.payload)
            expect(user.name).toEqual(updatedName)
        })
    })

    describe('Delete User', () => {
        it('fails and returns 400 error with invalid userId parameter ', async () => {
            const response = await server.inject({
                method: 'DELETE',
                url: '/users/jsj002'
            })
            expect(response.statusCode).toEqual(400)
        })
        it('Deletes a user with the given ID', async () => {
            const response = await server.inject({
                method: 'DELETE',
                url: `/users/${userId}`
            })
            expect(response.statusCode).toEqual(204)
        })
    })
})
