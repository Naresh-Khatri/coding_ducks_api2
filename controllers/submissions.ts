import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export interface ISubmissionsQuery {
  skip: number
  take: number
  searchTerm: string
  orderBy: string
  asc: boolean | string
}
export const getSubmissions = async (req: Request, res: Response) => {
  try {
    const { skip, take, orderBy, asc } = req.query
    if (!skip || !take)
      return res.status(400).json({ message: 'query params not sent' })

    const query = {
      orderBy: {
        [orderBy as string]: asc === 'true' ? 'asc' : 'desc',
      },
      select: {
        id: true,
        code: true,
        lang: true,
        total_tests: true,
        tests_passed: true,
        marks: true,
        timestamp: true,
        examId: true,
        User: {
          select: {
            fullname: true,
            username: true,
            photoURL: true,
            roll: true,
          },
        },

        userId: true,
        tests: true,
      },
      skip: +skip,
      take: +take,
      where: {},
    }
    if (req.query.searchTerm)
      query.where = {
        OR: [
          {
            User: {
              username: {
                contains: req.query.searchTerm as string,
                mode: 'insensitive',
              },
            },
          },
          {
            User: {
              fullname: {
                contains: req.query.searchTerm as string,
                mode: 'insensitive',
              },
            },
          },
          {
            User: {
              roll: {
                contains: req.query.searchTerm as string,
                mode: 'insensitive',
              },
            },
          },
          {
            id: {
              contains: req.query.searchTerm as string,
              mode: 'insensitive',
            },
          },
          {
            lang: {
              contains: req.query.searchTerm as string,
              mode: 'insensitive',
            },
          },
          {
            marks: {
              contains: req.query.searchTerm as string,
              mode: 'insensitive',
            },
          },
        ],
      }

    const submissions = await prisma.submission.findMany(query)

    const count = await prisma.submission.count()
    res.status(200).json({ submissions, count }) as any
  } catch (err) {
    console.log(err)
    res.status(404).json({ message: 'somethings wrong' }) as any
  }
}

export const getSubmissionById = async (req: Request, res: Response) => {
  try {
    const submission = await prisma.submission.findFirst({
      where: {
        id: +req.params.submissionId,
      },
    })
    const user = await prisma.user.findFirst({
      where: {
        id: submission?.userId,
      },
      select: {
        fullname: true,
        username: true,
        photoURL: true,
        roll: true,
      },
    })
    const exam = await prisma.exam.findFirst({
      where: {
        id: submission?.examId,
      },
      select: {
        id: true,
        slug: true,
        title: true,
      },
    })
    const problem = await prisma.problem.findFirst({
      where: {
        id: submission?.problemId,
      },
    })

    res.status(200).json({ submission, user, exam, problem })
  } catch (err) {
    console.log(err)
    res.status(404).json({ message: 'somethings wrong' })
  }
}
