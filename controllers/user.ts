import { Request, Response } from 'express'

import { Prisma, PrismaClient } from '@prisma/client'
import fileUpload from 'express-fileupload'
import imageKit from '../imagekit/config'
const prisma = new PrismaClient()

export const getUsers = async (req: Request, res: Response) => {
    //get users in order of their submission marks total
    try {
        const submissions = await prisma.submission.findMany({
            distinct: ['userId', 'problemId'],
            where: {
                marks: 10,
            },
            select: {
                userId: true,
                marks: true,
                problemId: true,
            },
        })
        const users = await prisma.user.findMany({
            select: {
                id: true,
                fullname: true,
                username: true,
                photoURL: true,
                registeredAt: true,
            }

        })
        //also provide ranks

        const testUsers = users.map(user => {
            const userSubmissions = submissions.filter(submission => submission.userId === user.id)
            const totalMarks = userSubmissions.reduce((acc, curr) => acc + curr.marks, 0)
            return { ...user, totalMarks, rank: 1 }
        }).sort((a, b) => b.totalMarks - a.totalMarks)

        let rank = 1
        for (let i = 1; i < testUsers.length; i++) {
            if (testUsers[i].totalMarks < testUsers[i - 1].totalMarks) rank++
            testUsers[i].rank = rank
        }


        res.json(testUsers)
    } catch (err) {
        res.status(404).json({ message: 'somethings wrong' })
        console.log(err)

    }
}

export const createUser = async (req: Request, res: Response) => {
    try {
        console.log(req.body)
        const newUser = await prisma.user.create({
            data: {
                ...req.body
            }
        })
        res.json(newUser)
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
            return res.status(400).json({ code: 69, message: 'User already exists' })
        res.status(404).json({ message: 'somethings wrong' })
        console.log(error)
    }
}
export const getUser = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findFirst({
            where: { googleUID: req.params.gid },
            include: {
                following: {
                    select: {
                        id: true, fullname: true, username: true, photoURL: true, registeredAt: true
                    }
                },
                followedBy: {
                    select: {
                        id: true, fullname: true, username: true, photoURL: true, registeredAt: true
                    }
                }
            }
        })
        res.json(user || [])
    } catch (err) {
        res.status(404).json({ message: 'somethings wrong' })
        console.log(err)
    }
}
//TODO: this function need some optimization
export const getUserUsingUsername = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findFirst({
            where: { username: { equals: req.params.username, mode: 'insensitive' } },
            include: {
                followedBy: {
                    select: {
                        id: true, fullname: true, username: true, photoURL: true, registeredAt: true
                    }
                }, following: {
                    select: {
                        id: true, fullname: true, username: true, photoURL: true, registeredAt: true
                    }
                }
            }
        })
        if (!user) return res.status(404).json({ message: 'user not found' })

        res.json(user)
    } catch (err) {
        res.status(404).json({ message: 'somethings wrong' })
        console.log(err)
    }
}
export const updateUser = async (req: Request, res: Response) => {
    try {
        await prisma.user.update({
            where: { id: req.user.userId }, data: { ...req.body }
        })
        const user = await prisma.user.findFirst({
            where: { id: req.user.userId },
            include: {
                following: {
                    select: {
                        id: true, fullname: true, username: true, photoURL: true, registeredAt: true
                    }
                },
                followedBy: {
                    select: {
                        id: true, fullname: true, username: true, photoURL: true, registeredAt: true
                    }
                }
            }
        })
        res.json(user)
    } catch (err) {
        res.status(404).json({ message: 'somethings wrong' })
        console.log(err)
    }
}
export const checkUsername = async (req: Request, res: Response) => {
    const { username } = req.body;
    const user = await prisma.user.findFirst({ where: { username: username } })
    res.json({ available: !!!user })

}


export const followUser = async (req: Request, res: Response) => {
    try {
        const { fromUser, toUser } = req.body
        await prisma.user.update({
            where: { id: fromUser },
            data: {
                following: {
                    connect: {
                        id: toUser
                    }
                }
            }
        })
        await prisma.user.update({
            where: { id: toUser },
            data: {
                followedBy: {
                    connect: {
                        id: fromUser
                    }
                }
            }
        })

        res.status(200).json({ message: 'success' })

    } catch (err) {
        res.status(404).json({ message: 'somethings wrong' })
        console.log(err)
    }
}

export const unfollowUser = async (req: Request, res: Response) => {
    try {
        const { fromUser, toUser } = req.body
        await prisma.user.update({
            where: { id: fromUser },
            data: {
                following: {
                    disconnect: {
                        id: toUser
                    }
                }
            }
        })
        await prisma.user.update({
            where: { id: toUser },
            data: {
                followedBy: {
                    disconnect: {
                        id: fromUser
                    }
                }
            }
        })
        res.status(200).json({ message: 'success' })

    } catch (err) {
        res.status(404).json({ message: 'somethings wrong' })
        console.log(err)
    }
}

export const getUserProgress = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                username: {
                    equals: req.params.username,
                    mode: 'insensitive'
                }
            },
            include: {
                Submission: {
                    distinct: 'problemId',
                    orderBy: {
                        marks: 'asc'
                    },
                    select: {
                        problemId: true,
                        marks: true,
                        lang: true,
                        timestamp: true,
                        Exam: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                            }
                        }
                    }
                }
            }
        })
        if (!user) return res.status(404).json({ message: 'user not found' })
        const result: any = await prisma.$queryRaw`SELECT timestamp::date, COUNT(*)::int
FROM "Submission"
WHERE "userId" = ${user.id}
GROUP BY timestamp::date
ORDER BY timestamp::date ASC;`
        const dailySubmissions = result.map((sub: any) => {
            return {
                date: sub.timestamp.toISOString().split('T')[0],
                count: sub.count
            }
        })
        const newSub = user?.Submission.reduce((acc, sub) => {
            const examId = sub.Exam.id
            if (acc[examId] == null) acc[examId] = []
            acc[examId].push(sub)
            return acc
        }, {} as any)
        res.status(200).json({ dailySubmissions, byExamId: newSub })
    } catch (err) {
        res.status(404).json({ message: 'somethings wrong' })
        console.log(err)
    }
}
export const uploadProfilePicture = async (req: Request, res: Response) => {
    const { userId } = req.user
    if (!req.files || Object.keys(req.files).length === 0)
        return res.status(404).json({ message: 'cover image not uploaded' })

    const newProfilePicture = req.files.newProfilePicture as fileUpload.UploadedFile
    const fileName = `${userId}-${Date.now}`
    try {
        const result = await imageKit.upload({
            file: newProfilePicture.data,
            fileName: fileName,
            folder: "/coding_ducks/profile_pictures/",
            extensions: [{ name: "google-auto-tagging", maxTags: 5, minConfidence: 95, },
            ],
        });
        console.log(result)
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                photoURL: result.url
            }
        })
        res.status(200).json(updatedUser)

    } catch (err) {
        console.log(err)
        res.status(404).json({ message: 'somethings wrong' })
    }
}