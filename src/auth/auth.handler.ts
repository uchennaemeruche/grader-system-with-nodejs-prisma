import { badImplementation, unauthorized, badRequest } from '@hapi/boom'
import { Request, ResponseToolkit } from '@hapi/hapi'
import { TokenType } from '@prisma/client'
import { add } from 'date-fns'
import { TokenService } from './token.service'
import { sign, Algorithm } from 'jsonwebtoken'

interface LoginInput {
    email: string
}

interface AuthenticateInput {
    email: string
    emailToken: string
}

export class AuthHandler {
    constructor(
        private service: TokenService,
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
            const token = await this.service.createToken(
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
            const result = await this.service.findToken(emailToken)
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

            const token = await this.service.createToken(
                email,
                tokenExpiration,
                TokenType.API
            )
            if (!token.success || !token.createdToken) {
                return badRequest()
            }

            await this.service.updateToken(result.emailToken.id, {
                valid: false
            })

            const authToken = this.geneateAuthToken(token.createdToken.id)
            return res.response().code(200).header('Authorization', authToken)
        } catch (error: any) {
            console.log(error)
            return badImplementation(error.message)
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
