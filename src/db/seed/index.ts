import { PrismaClient } from '@prisma/client'
import { add } from 'date-fns'
import { resetDB } from '../reset'

const prisma = new PrismaClient()

;(async () => {
    const weekFromNow = add(new Date(), { weeks: 1 })
    const twoWeeksFromNow = add(new Date(), { weeks: 2 })
    const monthFromNow = add(new Date(), { months: 1 })
    try {
        await resetDB()
        const john = await prisma.user.create({
            data: {
                email: 'johndoe@example.com',
                name: 'John Doe',
                social: {
                    facebook: '@john_doe',
                    twitter: '@johnthedoe'
                }
            }
        })
        const admin = await prisma.user.create({
            data: {
                email: 'admin@example.com',
                name: 'Adam Doe',
                social: {
                    facebook: '@adam_doe',
                    twitter: '@adamdoe'
                },
                isAdmin: true
            }
        })
        console.log('ADMIN', admin)

        const course = await prisma.course.create({
            data: {
                title: 'Data Structures and Algorithms',
                code: 'CSC 103',
                assessments: {
                    create: [
                        {
                            name: 'Data Structures 101',
                            date: weekFromNow
                        },
                        {
                            name: 'Algorithms 102',
                            date: twoWeeksFromNow
                        },
                        {
                            name: 'DS 103',
                            date: monthFromNow
                        }
                    ]
                },
                members: {
                    create: {
                        role: 'TEACHER',
                        user: {
                            connect: {
                                email: john.email
                            }
                        }
                    }
                }
            },
            include: {
                assessments: true
            }
        })

        const uchenna = await prisma.user.create({
            data: {
                email: 'uchenna@example.com',
                name: 'Uchenna Emeruche',
                social: {
                    twitter: '@EmerucheUchenna'
                },
                courses: {
                    create: {
                        role: 'STUDENT',
                        course: {
                            connect: { id: course.id }
                        }
                    }
                }
            }
        })

        const emeruche = await prisma.user.create({
            data: {
                email: 'emeruche@example.com',
                name: 'Emeruche Uchenna',
                courses: {
                    create: {
                        role: 'STUDENT',
                        course: {
                            connect: {
                                id: course.id
                            }
                        }
                    }
                }
            }
        })

        const uchennaAssessmentResult = [650, 900, 950]
        const emerucheAssessmentResult = [800, 870, 950]

        let counter = 0
        for (const assessment of course.assessments) {
            await prisma.assessmentResult.create({
                data: {
                    teacher: {
                        connect: { email: john.email }
                    },
                    student: {
                        connect: { email: uchenna.email }
                    },
                    assessment: {
                        connect: { id: assessment.id }
                    },
                    result: uchennaAssessmentResult[counter]
                }
            })

            await prisma.assessmentResult.create({
                data: {
                    teacher: {
                        connect: { email: john.email }
                    },
                    student: {
                        connect: { email: emeruche.email }
                    },
                    assessment: {
                        connect: { id: assessment.id }
                    },
                    result: emerucheAssessmentResult[counter]
                }
            })
            counter++
        }

        // aggregate result
        for (const assessment of course.assessments) {
            const results = await prisma.assessmentResult.aggregate({
                where: { assessmentId: assessment.id },
                _avg: { result: true },
                _max: { result: true },
                _min: { result: true },
                _count: true
            })
            console.log(
                `Assessment Result: ${assessment.name} (id: ${assessment.id})`,
                results
            )
        }

        // aggregate uchenna's performance
        const uchennaAggr = await prisma.assessmentResult.aggregate({
            where: { student: { email: uchenna.email } },
            _avg: { result: true },
            _max: { result: true },
            _min: { result: true },
            _count: true
        })
        console.log(
            `Uchenna's Performance: ${uchenna.name} (id: ${uchenna.id})`,
            uchennaAggr
        )
        // aggregate emeruche's performance
        const emerucheAggr = await prisma.assessmentResult.aggregate({
            where: { student: { email: emeruche.email } },
            _avg: { result: true },
            _max: { result: true },
            _min: { result: true },
            _count: true
        })
        console.log(
            `Emeruche's Performance: ${emeruche.name} (id: ${emeruche.id})`,
            emerucheAggr
        )

        prisma.$disconnect()
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
})()
