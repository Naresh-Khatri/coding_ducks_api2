import { Request, Response } from 'express'

import { Prisma, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany()

        res.json(users)
    } catch (err) {
        res.status(404).json({ message: 'somethings wrong' })

    }
}
export const createUser = async (req: Request, res: Response) => {
    try {
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
            where: { username: req.params.username },
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
        res.json(user || [])
    } catch (err) {
        res.status(404).json({ message: 'somethings wrong' })
        console.log(err)
    }
}
export const updateUser = async (req: Request, res: Response) => {
    try {
        await prisma.user.update({
            where: { id: req.user.user_id }, data: { ...req.body }
        })
        const user = await prisma.user.findFirst({
            where: { id: req.user.user_id },
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
        const submissions = await prisma.submission.findMany({
            distinct: 'problemId',
            orderBy: {
                marks: 'asc',
            },
            where: {
                user_id: +req.params.userId,
            },
            select: {
                Exam: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    }
                },
                timestamp: true,
                problemId: true,
                marks: true,
                lang: true,
            },


        })
        const newSub = submissions.reduce((acc, sub) => {
            const examId = sub.Exam.id
            if (acc[examId] == null) acc[examId] = []
            acc[examId].push(sub)
            return acc
        }, {} as any)
        res.status(200).json(newSub)
    } catch (err) {
        res.status(404).json({ message: 'somethings wrong' })
        console.log(err)
    }
}