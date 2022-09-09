import { Request, Response } from 'express'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const getUsers = async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({})
    res.json(users)
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
        res.status(404).json({ message: 'somethings wrong' })
        console.log(error)
    }
}
export const getUser = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findFirst({ where: { googleUID: req.params.id } })
        res.json(user || [])
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