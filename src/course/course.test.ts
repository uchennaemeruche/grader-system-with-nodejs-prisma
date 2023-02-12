import {
    AppCredentials,
    AuthCredentials,
    Server,
    UserCredentials
} from '@hapi/hapi'
import { UserRole } from '@prisma/client'

import { API_AUTH_STATEGY } from '../auth/auth.route'
import { resetDB } from '../db/reset'
import { AppServer } from '../server/app'
import { createUserCredentials } from '../test/test.helper'
import { CourseInput, CourseResponseObject } from './course.service'

describe('Course Test', () => {
    let server: Server

    beforeAll(async () => {
        await resetDB()
        server = await new AppServer(3000, 'localhost').createServer()
    })

    afterAll(async () => {
        await resetDB()
        await server.stop()
    })
    let defaultCredentials: AuthCredentials<UserCredentials, AppCredentials>
    describe('Create Course', () => {
        it('creates a new course and returns a 201', async () => {
            const payload = {
                title: 'Test Course',
                details: 'Introduction to test course',
                courseCode: 'TSC201'
            }

            const response = await server.inject({
                url: '/courses',
                method: 'POST',
                payload,
                auth: {
                    strategy: API_AUTH_STATEGY,
                    credentials: await createUserCredentials(
                        server.app.prisma,
                        false
                    )
                }
            })
            expect(response.statusCode).toEqual(201)
            expect(response.result).toHaveProperty('id')
            expect(response.result).toHaveProperty('title', payload.title)
            expect(response.result).toHaveProperty(
                'courseDetails',
                payload.details
            )
        })
        it('creates a new course, assigns a teacher and returns a 201', async () => {
            const credentials = await createUserCredentials(
                server.app.prisma,
                false
            )
            const payload: CourseInput = {
                title: 'Test Course',
                details: 'Introduction to test course',
                courseCode: 'TSC 112',
                member: {
                    role: UserRole.TEACHER,
                    id: credentials.userId
                }
            }
            const response = await server.inject({
                url: '/courses',
                method: 'POST',
                payload,
                auth: {
                    strategy: API_AUTH_STATEGY,
                    credentials
                }
            })
            defaultCredentials = credentials
            expect(response.statusCode).toEqual(201)
            expect(response.result).toHaveProperty('id')
            expect(response.result).toHaveProperty('title', payload.title)
            expect(response.result).toHaveProperty(
                'courseDetails',
                payload.details
            )
        })
        it('returns a 401 error for not passing auth parameters', async () => {
            const payload = {
                title: 'Test Course',
                details: 'Introduction to test course'
            }
            const response = await server.inject({
                url: '/courses',
                method: 'POST',
                payload
            })
            expect(response.statusCode).toEqual(401)
            expect(response.result).toHaveProperty('error')
        })
        it('returns an input validation error for incomplete input payload', async () => {
            const response = await server.inject({
                url: '/courses',
                method: 'POST',
                payload: {
                    details: 'Introduction to test course'
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
        })
    })

    describe('Get Courses', () => {
        it('Returns a list of all courses if user is admin', async () => {
            const response = await server.inject({
                url: '/courses',
                method: 'GET',
                auth: {
                    strategy: API_AUTH_STATEGY,
                    credentials: await createUserCredentials(
                        server.app.prisma,
                        true
                    )
                }
            })
            expect(response.statusCode).toEqual(200)
            expect(Array.isArray(['response.result'])).toBe(true)
            const result = response.result as Array<object>
            expect(result.length).toBeGreaterThanOrEqual(1)
        })
        it('Returns a list of courses that the user is either a teacher or student of', async () => {
            const response = await server.inject({
                url: '/courses',
                method: 'GET',
                auth: {
                    strategy: API_AUTH_STATEGY,
                    credentials: defaultCredentials
                }
            })

            expect(response.statusCode).toEqual(200)
            expect(Array.isArray(['response.result'])).toBe(true)

            const result = response.result as Array<CourseResponseObject>
            result.every((res) => {
                expect(
                    res.members?.[0].userId === defaultCredentials.userId
                ).toBe(true)
            })
            expect(result.length).toBeGreaterThanOrEqual(1)
        })
    })
})
