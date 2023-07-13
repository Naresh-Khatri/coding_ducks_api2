import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export interface ISubmissionsQuery {
  skip: number;
  take: number;
  searchTerm: string;
  orderBy: string;
  asc: boolean | string;
}
export const getSubmissions = async (req: Request, res: Response) => {
  try {
    const { skip, take, orderBy, asc } = req.query;
    if (!skip || !take)
      return res.status(400).json({ message: "query params not sent" });

    const query = {
      orderBy: {
        [orderBy as string]: asc === "true" ? "asc" : "desc",
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
    };
    if (req.query.searchTerm) {
      query.where = {
        OR: [
          {
            User: {
              username: {
                contains: req.query.searchTerm as string,
                mode: "insensitive",
              },
            },
          },
          {
            User: {
              fullname: {
                contains: req.query.searchTerm as string,
                mode: "insensitive",
              },
            },
          },
          {
            User: {
              roll: {
                contains: req.query.searchTerm as string,
                mode: "insensitive",
              },
            },
          },
          {
            lang: {
              contains: req.query.searchTerm as string,
              mode: "insensitive",
            },
          },
        ],
      };
    }
    const submissions = await prisma.submission.findMany(query);

    const count = await prisma.submission.count();
    res.status(200).json({ submissions, count }) as any;
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" }) as any;
  }
};

export const getSubmissionById = async (req: Request, res: Response) => {
  try {
    const submission = await prisma.submission.findFirst({
      where: {
        id: +req.params.submissionId,
      },
      include: {
        User: {
          select: {
            fullname: true,
            username: true,
            photoURL: true,
            roll: true,
          },
        },
        Exam: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
        Problem: true,
      },
    });
    if (!submission)
      return res.status(404).json({ message: "submission not found" });

    res.status(200).json({ data: submission, message: "success" });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};

interface IRequest extends Request {
  query: {
    problemId: string;
    lang: string;
  };
}
export const getLastSubmission = async (req: IRequest, res: Response) => {
  try {
    const { problemId, lang } = req.query;
    if (!problemId || !lang)
      return res.status(400).json({ message: "params not sent" });

    const sub = await prisma.submission.findFirst({
      where: {
        problemId: +problemId,
        lang,
      },
      orderBy: [
        {
          marks: "desc",
        },
        {
          timestamp: "desc",
        },
      ],
    });
    if (!sub)
      return res.status(404).json({
        data: null,
        message: "Submission not found for " + problemId + " " + lang,
      });
    res.status(200).json({ data: sub, message: "success" });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};

export const getSubmissionsByCurrentUserAndProblemId = async (
  req: Request,
  res: Response
) => {
  try {
    const { problemId } = req.params;
    const { userId } = req.user;
    if (!problemId || !userId)
      return res.status(400).json({ message: "params not sent" });

    const sub = await prisma.submission.findMany({
      where: {
        problemId: +problemId,
        userId: userId,
      },
      include: {
        User: {
          select: {
            fullname: true,
            username: true,
            photoURL: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });
    if (!sub)
      return res.status(404).json({
        data: null,
        message: "Submission not found for " + problemId + " " + userId,
      });
    res.status(200).json({ data: sub, message: "success" });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
