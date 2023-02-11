import { Server } from '@hapi/hapi'
import { API_AUTH_STATEGY } from '../auth/auth.route'
import { AppServer } from '../server/app'
import { createUserCredentials } from '../test/test.helper'

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
                },
                auth: {
                    strategy: API_AUTH_STATEGY,
                    credentials: await createUserCredentials(
                        server.app.prisma,
                        false
                    )
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
                },
                auth: {
                    strategy: API_AUTH_STATEGY,
                    credentials: await createUserCredentials(
                        server.app.prisma,
                        false
                    )
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
                url: '/users',
                auth: {
                    strategy: API_AUTH_STATEGY,
                    credentials: await createUserCredentials(
                        server.app.prisma,
                        false
                    )
                }
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
        it('Returns a single user when the requesting Non-Admin User ID equals the requested user ID', async () => {
            const credentials = await createUserCredentials(
                server.app.prisma,
                false
            )
            const response = await server.inject({
                method: 'GET',
                url: `/users/${credentials.userId}`,
                auth: {
                    strategy: API_AUTH_STATEGY,
                    credentials
                }
            })
            expect(response.statusCode).toEqual(200)
            expect(response.result).toMatchSnapshot({
                id: expect.any(Number),
                email: expect.any(String),
                name: expect.any(String),
                social: expect.any(Object),
                isAdmin: expect.any(Boolean)
            })
        })
        it('Returns a single user when the requesting User isAdmin', async () => {
            const credentials = await createUserCredentials(
                server.app.prisma,
                true
            )
            const response = await server.inject({
                method: 'GET',
                url: `/users/${userId}`,
                auth: {
                    strategy: API_AUTH_STATEGY,
                    credentials
                }
            })
            expect(response.statusCode).toEqual(200)
            expect(response.result).toMatchSnapshot({
                id: expect.any(Number),
                email: expect.any(String),
                name: expect.any(String),
                social: expect.any(Object),
                isAdmin: expect.any(Boolean)
            })
        })
        it('Returns a 403 Error when the requesting user is not equals to user ID', async () => {
            const credentials = await createUserCredentials(
                server.app.prisma,
                false
            )
            const response = await server.inject({
                method: 'GET',
                url: `/users/${userId}`,
                auth: {
                    strategy: API_AUTH_STATEGY,
                    credentials
                }
            })

            expect(response.statusCode).toEqual(403)
            expect(response.result).toHaveProperty('error')
        })
        it('Returns 404 for a wrong or non-existing user', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/users/1000',
                auth: {
                    strategy: API_AUTH_STATEGY,
                    credentials: await createUserCredentials(
                        server.app.prisma,
                        true
                    )
                }
            })

            expect(response.statusCode).toEqual(404)
        })
        it('Returns a 400 validation error for an invalid param', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/users/aaksllss',
                auth: {
                    strategy: API_AUTH_STATEGY,
                    credentials: await createUserCredentials(
                        server.app.prisma,
                        true
                    )
                }
            })
            expect(response.statusCode).toEqual(400)
            expect(response.result).toHaveProperty('error')
        })
    })
    describe('Update User', () => {
        it('fails and returns 400 error given an invalid userId parameter', async () => {
            const response = await server.inject({
                method: 'PUT',
                url: `/users/jfjjkdkd`,
                auth: {
                    strategy: API_AUTH_STATEGY,
                    credentials: await createUserCredentials(
                        server.app.prisma,
                        true
                    )
                }
            })
            expect(response.statusCode).toEqual(400)
        })
        it('returns 404 for non-existing userId', async () => {
            const response = await server.inject({
                method: 'PUT',
                url: `/users/1`,
                auth: {
                    strategy: API_AUTH_STATEGY,
                    credentials: await createUserCredentials(
                        server.app.prisma,
                        true
                    )
                }
            })
            expect(response.statusCode).toEqual(400)
        })
        it('updates a user when requesting User Id equals ID of user to be updated', async () => {
            const updatedName = 'Uchechukwu Emeruche'
            const credentials = await createUserCredentials(
                server.app.prisma,
                false
            )
            const response = await server.inject({
                method: 'PUT',
                url: `/users/${credentials.userId}`,
                payload: {
                    name: updatedName
                },
                auth: {
                    strategy: API_AUTH_STATEGY,
                    credentials
                }
            })
            expect(response.statusCode).toEqual(200)
            const user = JSON.parse(response.payload)
            expect(user.name).toEqual(updatedName)
        })
        it('updates a user when requesting User equals admin', async () => {
            const updatedName = 'Uchechukwu Emeruche'
            const response = await server.inject({
                method: 'PUT',
                url: `/users/${userId}`,
                payload: {
                    name: updatedName
                },
                auth: {
                    strategy: API_AUTH_STATEGY,
                    credentials: await createUserCredentials(
                        server.app.prisma,
                        true
                    )
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
                url: '/users/jsj002',
                auth: {
                    strategy: API_AUTH_STATEGY,
                    credentials: await createUserCredentials(
                        server.app.prisma,
                        true
                    )
                }
            })
            expect(response.statusCode).toEqual(400)
        })
        it('Deletes a user when requesting User Id equals ID of user to be deleted', async () => {
            const credentials = await createUserCredentials(
                server.app.prisma,
                false
            )
            const response = await server.inject({
                method: 'DELETE',
                url: `/users/${credentials.userId}`,
                auth: {
                    strategy: API_AUTH_STATEGY,
                    credentials: credentials
                }
            })
            expect(response.statusCode).toEqual(204)
        })
        it('Deletes a user when requesting User is admin', async () => {
            const response = await server.inject({
                method: 'DELETE',
                url: `/users/${userId}`,
                auth: {
                    strategy: API_AUTH_STATEGY,
                    credentials: await createUserCredentials(
                        server.app.prisma,
                        true
                    )
                }
            })
            expect(response.statusCode).toEqual(204)
        })
    })
})
