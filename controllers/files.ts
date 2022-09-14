import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()


export const getUserFiles = async (req: Request, res: Response) => {
    const { userID } = req.params;
    try {
        const files = await prisma.file.findMany({
            where: {
                userId: Number(userID)
            },
            orderBy: {
                fileName: 'asc'
            },

        })
        console.log(files)
        res.json(files)

    } catch (err) {
        console.log(err)
        res.status(404).json({ message: 'somethings wrong' })
    }
}

export const createUserFile = async (req: Request, res: Response) => {
    try {
        const createdFile = await prisma.file.create({
            data: {
                ...req.body,
            }
        })
        res.status(201).json(createdFile)
    } catch (err) {
        console.log(err)
        res.status(404).json({ message: 'couldnt create file!' })
    }
}
export const updateUserFile = async (req: Request, res: Response) => {
    try {
        const updatedFile = await prisma.file.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                ...req.body
            }
        })
        res.status(200).json(updatedFile)
    } catch (err) {
        console.log(err)
        res.status(404).json({ message: 'couldnt update file!' })
    }
}
export const deleteUserFile = async (req: Request, res: Response) => {
    try {
        const deletedFile = await prisma.file.delete({
            where: {
                id: Number(req.params.id)
            }
        })
        res.status(200).json(deletedFile)
    } catch (err) {
        console.log(err)
        res.status(404).json({ message: 'couldnt delete file!' })
    }
}

export const getAllFiles = async (req: Request, res: Response) => {
    console.log('hi')
    const files = await prisma.file.findMany({
        where: {
            lang: 'py'
        }
    })
    res.json(files)

}