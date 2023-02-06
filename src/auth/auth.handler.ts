import { badImplementation } from '@hapi/boom'
import { Request, ResponseToolkit } from '@hapi/hapi'
import { add } from 'date-fns'

interface LoginInput {
    email: string
}

// interface AuthenticateInput {
//     email: string
//     emailToken: string
// }
export class AuthHandler {
    constructor(
        private EMAIL_TOKEN_EXPIRATION_MINUTES: number,
        private TOKEN_EXPIRATION_HOURS: number,
        private JWT_ALGORITHM: string,
        private JWT_SECRET: string
    ) {
        console.log('HELLO THERE')
    }
    async login(req: Request, res: ResponseToolkit) {
        const { prisma, sendEmail } = req.server.app
        const { email } = req.payload as LoginInput
        const emailToken = generateToken()
        const tokenExpiration = add(new Date(), {
            minutes: this.EMAIL_TOKEN_EXPIRATION_MINUTES
        })

        try {
            const createdToken = await prisma.token.create({
                data: {
                    emailToken,
                    type: 'EMAIL',
                    expiration: tokenExpiration,
                    user: {
                        connectOrCreate: {
                            create: {
                                email
                            },
                            where: {
                                email
                            }
                        }
                    }
                }
            })
            console.log('CREATED:', createdToken)
            await sendEmail(email, emailToken)

            return res
                .response('A login token has been sent to your email address')
                .code(200)
        } catch (error: any) {
            console.log('ERROR:', error)
            return badImplementation(error.message)
        }
    }

    async authenticate(req: Request, res: ResponseToolkit) {
        const { prisma } = req.server.app
        try {
            const users = await prisma.user.findMany()
            return res.response(users).code(200)
        } catch (error) {
            console.log(error)
        }
    }

    generateEmailToken = () => {
        const token = Math.floor(10000000 + Math.random() * 90000000).toString()
        console.log('GENEATED TOKEN:', token)
        return token
    }
}

const generateToken = () => {
    const token = Math.floor(10000000 + Math.random() * 90000000).toString()
    console.log('GENEATED TOKEN:', token)
    return token
}
