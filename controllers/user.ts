import { Request, Response } from 'express'

import { Prisma, PrismaClient } from '@prisma/client'
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
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
            return res.status(400).json({ code: 69, message: 'User already exists' })
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
export const updateUser = async (req: Request, res: Response) => {
    try {
        console.log(req.body)
        const user = await prisma.user.update({ where: { googleUID: req.body.googleUID }, data: { ...req.body } })
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