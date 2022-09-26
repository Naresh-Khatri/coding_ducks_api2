import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()



export const getAllExams = async (req: Request, res: Response) => {
  const { userID } = req.params;
  try {
    const exams = await prisma.exam.findMany({ orderBy: { id: 'asc' } })
    res.status(200).json(exams)

  } catch (err) {
    console.log(err)
    res.status(404).json({ message: 'somethings wrong' })
  }
}


export const getExam = async (req: Request, res: Response) => {
  const { userID } = req.params;
  try {
    const exam = await prisma.exam.findUnique({
      where: {
        id: +userID
      }
    })
    res.status(200).json(exam)

  } catch (err) {
    console.log(err)
    res.status(404).json({ message: 'somethings wrong' })
  }
}


export const createExam = async (req: Request, res: Response) => {
  const { userID } = req.params;
  console.log(req.body)
  try {
    const newExam = await prisma.exam.create({
      data: {
        ...req.body
      }
    })
    res.status(200).json(newExam)

  } catch (err) {
    console.log(err)
    res.status(404).json({ message: 'somethings wrong' })
  }
}
export const updateExam = async (req: Request, res: Response) => {
  const { userID } = req.params;
  console.log(req.body)
  try {
    const updatedExam = await prisma.exam.update({
      where: {
        id: +req.params.examId
      },
      data: {
        ...req.body
      }
    })
    res.status(200).json(updatedExam)

  } catch (err) {
    console.log(err)
    res.status(404).json({ message: 'somethings wrong' })
  }
}
export const deleteExam = async (req: Request, res: Response) => {
  const { userID } = req.params;
  try {
    const deletedExam = await prisma.exam.delete({
      where: {
        id: +req.params.examId
      },
    })
    res.status(200).json({ message: 'deleted' })

  } catch (err) {
    console.log(err)
    res.status(404).json({ message: 'somethings wrong' })
  }
}