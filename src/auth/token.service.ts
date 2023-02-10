import { PrismaClient, TokenType } from '@prisma/client'

export class TokenService {
    constructor(private prisma: PrismaClient) {}

    createToken = async (
        email: string,
        tokenExpiresAt: Date,
        type: TokenType,
        token?: string
    ) => {
        try {
            const createdToken = await this.prisma.token.create({
                data: {
                    type,
                    emailToken: token,
                    expiration: tokenExpiresAt,
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
            return { success: true, createdToken }
        } catch (error: any) {
            return { success: false, error }
        }
    }
    findToken = async (filter: object) => {
        const emailToken = await this.prisma.token.findUnique({
            where: filter,
            include: {
                user: true
            }
        })
        if (!emailToken) {
            return { success: false, error: new Error('token not found') }
        }
        return { success: true, emailToken }
    }

    updateToken = async (id: number, data = {}) => {
        await this.prisma.token.update({
            where: {
                id
            },
            data
        })
    }
}

// TokenUpdateInput
// TokenWhereUniqueInput
// TokenUpdateArgs
