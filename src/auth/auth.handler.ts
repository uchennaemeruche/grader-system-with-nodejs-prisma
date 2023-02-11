import { badImplementation, unauthorized, badRequest } from '@hapi/boom'
import { Request, ResponseToolkit } from '@hapi/hapi'
import { TokenType, UserRole } from '@prisma/client'
import { add } from 'date-fns'
import { TokenService } from './token.service'
import { sign, Algorithm } from 'jsonwebtoken'
import Joi from 'joi'
import { CourseService } from '../course/course.service'

interface LoginInput {
    email: string
}

interface AuthenticateInput {
    email: string
    emailToken: string
}

interface APITokenPayload {
    tokenId: number
}

const apiTokenSchema = Joi.object({
    tokenId: Joi.number().integer().required()
})

export class AuthHandler {
    constructor(
        private tokenService: TokenService,
        private courseService: CourseService,
        private tokenExpiration: number,
        private TOKEN_EXPIRATION_HOURS: number,
        private JWT_ALGORITHM: Algorithm,
        private JWT_SECRET: string
    ) {}
    async login(req: Request, res: ResponseToolkit) {
        const { email } = req.payload as LoginInput
        const emailToken = this.generateToken()

        const tokenExpiresAt = add(new Date(), {
            minutes: this.tokenExpiration
        })

        try {
            const token = await this.tokenService.createToken(
                email,
                tokenExpiresAt,
                TokenType.EMAIL,
                emailToken
            )
            if (token.success) {
                req.server.app.sendEmail(email, emailToken)

                return res
                    .response(
                        'A login token has been sent to your email address'
                    )
                    .code(200)
            }
            return badImplementation(token.error.message)
        } catch (error: any) {
            console.log('ERROR:', error)
            return badImplementation(error.message)
        }
    }

    // authenticate generated email token
    async authenticateToken(req: Request, res: ResponseToolkit) {
        const { email, emailToken } = req.payload as AuthenticateInput
        try {
            const result = await this.tokenService.findToken({ emailToken })
            if (!result.success || !result.emailToken?.valid) {
                return unauthorized()
            }

            // check if token has expired, return 401
            if (result.emailToken.expiration < new Date()) {
                return unauthorized('token expired')
            }

            // check if token matches user email passed in the payload
            if (result.emailToken.user.email !== email) {
                return unauthorized()
            }
            const tokenExpiration = add(new Date(), {
                minutes: this.TOKEN_EXPIRATION_HOURS
            })

            const token = await this.tokenService.createToken(
                email,
                tokenExpiration,
                TokenType.API
            )
            if (!token.success || !token.createdToken) {
                return badRequest()
            }

            await this.tokenService.updateToken(result.emailToken.id, {
                valid: false
            })

            const authToken = this.geneateAuthToken(token.createdToken.id)
            return res.response().code(200).header('Authorization', authToken)
        } catch (error: any) {
            console.log(error)
            return badImplementation(error.message)
        }
    }

    validateApiToken = async (
        decoded: APITokenPayload,
        req: Request,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        res: ResponseToolkit
    ) => {
        const { tokenId } = decoded
        const { error } = apiTokenSchema.validate(decoded)

        if (error) {
            req.log(['error', 'auth'], `API token error: ${error.message}`)
            return { isValid: false }
        }

        try {
            const token = await this.tokenService.findToken({ id: tokenId })
            if (
                !token.success ||
                !token.emailToken ||
                !token.emailToken.valid
            ) {
                return { isValid: false, error: 'Invalid Token' }
            }

            if (token.emailToken.expiration < new Date()) {
                return { isValid: false, error: 'Token expired' }
            }

            const teacherOf = await this.courseService.findCourseEnrollment({
                userId: token.emailToken.userId,
                role: UserRole.TEACHER
            })
            if (!teacherOf.success || !teacherOf.courseTeacher) {
                return { isValid: false }
            }

            // At this point, the token is valid. Make `userId`, `isAdmin` and `teacherOf` to `credentials` which is available in route handlers via `request.auth.credentials`
            return {
                isValid: true,
                credentials: {
                    tokenId: decoded.tokenId,
                    userId: token.emailToken.userId,
                    isAdmin: token.emailToken.user.isAdmin,
                    // convert teacherOf from an array of objects to an array of numbers
                    teacherOf: teacherOf.courseTeacher.map(
                        ({ courseId }) => courseId
                    )
                }
            }
        } catch (error: any) {
            req.log(['error', 'auth', 'db'], error)
            return { isValid: false }
        }
    }

    private generateToken = () => {
        const token = Math.floor(10000000 + Math.random() * 90000000).toString()
        return token
    }

    private geneateAuthToken = (tokenId: number) => {
        const jwtPayload = { tokenId }

        return sign(jwtPayload, this.JWT_SECRET, {
            noTimestamp: true,
            algorithm: this.JWT_ALGORITHM
        })
    }
}
