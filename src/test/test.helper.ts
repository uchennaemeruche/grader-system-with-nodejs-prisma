import { AuthCredentials } from '@hapi/hapi'
import { PrismaClient, TokenType, UserRole } from '@prisma/client'
import { add } from 'date-fns'

export const createUserCredentials = async (
    prisma: PrismaClient,
    isAdmin: boolean
): Promise<AuthCredentials> => {
    const testUser = await prisma.user.create({
        data: {
            name: 'test--name',
            email: `test-${
                Date.now() +
                Math.floor(10000000 + Math.random() * 90000000).toString()
            }@test.io`,
            isAdmin,
            tokens: {
                create: {
                    expiration: add(new Date(), { days: 7 }),
                    type: TokenType.API
                }
            }
        },
        include: {
            tokens: true,
            courses: {
                where: {
                    role: UserRole.TEACHER
                },
                select: {
                    courseId: true
                }
            }
        }
    })

    const testCredentials = {
        userId: testUser.id,
        tokenId: testUser.tokens[0].id,
        isAdmin: testUser.isAdmin,
        teacherOf: testUser.courses.map(({ courseId }) => courseId)
    }

    return testCredentials
}
