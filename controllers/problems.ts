import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { IProblemWithSubmissions } from "../types";
const prisma = new PrismaClient();

export const getAllProblems = async (req: Request, res: Response) => {
  try {
    console.log(req.query);
    const q = {
      where: {
        examId: null,
      },
      orderBy: [{ frontendProblemId: "desc" }],

      include: {
        tags: true,
        starterCodes: true,
        exam: {
          select: {
            slug: true,
            title: true,
          },
        },
      },
    } as Prisma.ProblemFindManyArgs;

    if (req.query?.allowExams) {
      q.where = {
        examId: undefined,
      };
      q.orderBy = [
        { examId: "desc" },
        { order: "desc" },
        { frontendProblemId: "desc" },
      ];
    }

    const problemsList = await prisma.problem.findMany(q);
    res.status(200).json(problemsList);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};

export const getProblemTags = async (req: Request, res: Response) => {
  try {
    const tags = await prisma.problemTag.findMany();
    res.status(200).json({ message: "ok", data: { count: tags.length, tags } });
  } catch (err) {
    console.log(err);
  }
};

export const getProblemBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  try {
    const problem = await prisma.problem.findUnique({
      where: {
        slug,
      },
      include: {
        tags: true,
        submissions: {
          where: {
            userId: req.user?.userId,
          },
        },
        starterCodes: true,
      },
    });

    // if we have req.user, then we can check if the user has solved the problem
    const userCorrectSub = await prisma.submission.findFirst({
      where: {
        userId: req.user?.userId,
        problemId: problem?.id,
      },
      select: {
        id: true,
        marks: true,
      },
      orderBy: {
        marks: "desc",
      },
    });
    const status =
      userCorrectSub?.marks === 10
        ? "solved"
        : userCorrectSub?.marks === 0
        ? "tried"
        : "unsolved";

    const submissionCount = await prisma.submission.count({
      where: {
        problemId: problem?.id,
      },
    });
    const acceptedCount = await prisma.submission.count({
      where: {
        problemId: problem?.id,
        marks: 10,
      },
    });
    const accuracy =
      acceptedCount === 0 || submissionCount === 0
        ? 0
        : (acceptedCount / submissionCount) * 100;

    if (!problem) return res.status(404).json({ message: "problem not found" });
    res.status(200).json({
      data: {
        ...problem,
        submissionCount,
        acceptedCount,
        accuracy,
        status,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};

export const getProblemRating = async (req: Request, res: Response) => {
  const { problemId } = req.params;
  try {
    // get likes and dislikes count
    const problem = await prisma.problem.findUnique({
      where: {
        id: +problemId,
      },
      select: {
        likes: {
          select: {
            id: true,
            username: true,
            photoURL: true,
          },
        },
        dislikes: {
          select: {
            id: true,
            username: true,
            photoURL: true,
          },
        },
      },
    });

    if (!problem) return res.status(404).json({ message: "problem not found" });

    // logic to get user rating
    const userRating = await prisma.problem.findUnique({
      where: {
        id: +problemId,
      },
      select: {
        likes: {
          where: {
            id: req.user?.userId,
          },
          select: {
            id: true,
          },
        },
        dislikes: {
          where: {
            id: req.user?.userId,
          },
          select: {
            id: true,
          },
        },
      },
    });

    const likes = userRating?.likes.length;
    const dislikes = userRating?.dislikes.length;

    let rating = "none";
    if (req.user?.userId) {
      if (likes && likes > 0) rating = "like";
      else if (dislikes && dislikes > 0) rating = "dislike";
    }

    res.status(200).json({ data: { rating: problem, userRating: rating } });
  } catch (err) {
    console.log(err);

    res.status(404).json({ message: "somethings wrong" });
  }
};

export const updateProblemRating = async (req: Request, res: Response) => {
  try {
    const { problemId, action } = req.body;
    const { userId } = req.user;
    if (action === "like") {
      await prisma.problem.update({
        where: { id: +problemId },
        data: {
          likes: { connect: { id: +userId } },
          dislikes: { disconnect: { id: +userId } },
        },
      });
    } else if (action === "dislike") {
      await prisma.problem.update({
        where: { id: +problemId },
        data: {
          likes: { disconnect: { id: +userId } },
          dislikes: { connect: { id: +userId } },
        },
      });
    } else {
      await prisma.problem.update({
        where: { id: problemId },
        data: {
          likes: { disconnect: { id: +userId } },
          dislikes: { disconnect: { id: +userId } },
        },
      });
    }
    getProblemRating(req, res);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};

export const getProblemsForProblemPage = async (
  req: Request,
  res: Response
) => {
  const { query } = req;
  const { q, sortBy, orderBy, skip, limit } = query;
  try {
    const queryObj: Prisma.ProblemFindManyArgs = {
      where: {
        examId: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        tags: true,
        frontendProblemId: true,
        submissions: {
          distinct: ["userId"],
          where: {
            marks: 10,
          },
          select: {
            userId: true,
            timestamp: true,
            User: {
              select: {
                username: true,
                photoURL: true,
              },
            },
          },
          orderBy: {
            timestamp: "desc",
          },
        },
      },

      orderBy: {
        frontendProblemId: "asc",
      },
    };
    // search by title
    if (q)
      queryObj.where = { ...queryObj.where, title: { contains: q as string } };
    // sort by
    if (sortBy)
      queryObj.orderBy = { [sortBy as string]: orderBy as Prisma.SortOrder };

    if (skip) queryObj.skip = +skip;
    if (limit) queryObj.take = +limit;
    const data = await prisma.problem.findMany(queryObj);
    const problemsList = data.map((problem: IProblemWithSubmissions, i) => {
      // console.log(problem?.submissions);
      return {
        ...problem,
        status: problem?.submissions?.some(
          (sub) => sub.userId === req.user?.userId
        )
          ? "solved"
          : "unsolved",
      };
    });

    const count = await prisma.problem.count({ where: { examId: null } });

    res.status(200).json({ message: "ok", data: { problemsList, count } });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
export const getExamProblems = async (req: Request, res: Response) => {
  try {
    //check if user can access this exam
    const exam = await prisma.exam.findUnique({
      where: {
        id: +req.params.examId,
      },
      select: {
        active: true,
      },
    });
    if (!exam?.active && !req.user?.isAdmin)
      return res.status(404).json({ message: "You dont have permission" });

    const problemsList = await prisma.problem.findMany({
      where: {
        examId: +req.params.examId,
      },
      orderBy: {
        order: "asc",
      },
    });
    res.status(200).json(problemsList);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
export const getProblem = async (req: Request, res: Response) => {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: +req.params.problemId },
    });
    res.status(200).json(problem);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};

// TODO: optimize tags update logic
export const updateProblem = async (req: Request, res: Response) => {
  try {
    let updatedProblem = await prisma.problem.update({
      where: {
        id: +req.params.problemId,
      },
      data: {
        ...req.body,
        tags: {},
        starterCodes: {
          updateMany: req.body.starterCodes.map((starterCode: any) => ({
            where: {
              id: starterCode.id,
            },
            data: {
              code: starterCode.code,
            },
          })),
        },
      },
      include: {
        starterCodes: true,
        tags: true,
      },
    });

    await prisma.problem.update({
      where: {
        id: +req.params.problemId,
      },
      data: {
        tags: {
          disconnect: updatedProblem.tags.map((tag: any) => ({
            id: tag.id,
          })),
        },
      },
    });
    await prisma.problem.update({
      where: {
        id: +req.params.problemId,
      },
      data: {
        tags: {
          connectOrCreate: req.body.tags.map((tag: any) => ({
            where: { name: tag.name },
            create: { name: tag.name },
          })),
        },
      },
    });

    // await prisma.problem.update({
    //   where: {
    //     id: +req.params.problemId,
    //   },
    //   data: {
    //     tags: {
    //       disconnect: savedTags.map((tagId:number) => ({ id: tagId })),
    //       // connectOrCreate: req.body.tags.map((tag: any) => ({
    //       //   where: { name: tag.name },
    //       //   create: { name: tag.name },
    //       // })),
    //     },
    //   },
    // });

    // TODO: remove starter codes if there are no starter codes in the request
    // if there were no starter codes before
    if (updatedProblem.starterCodes.length === 0) {
      updatedProblem = await prisma.problem.update({
        where: {
          id: +req.params.problemId,
        },
        data: {
          starterCodes: {
            create: req.body.starterCodes.map((starterCode: any) => ({
              code: starterCode.code,
              lang: starterCode.lang,
            })),
          },
        },
        include: {
          starterCodes: true,
          tags: true,
        },
      });
    }

    res.status(200).json(updatedProblem);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
export const deleteProblem = async (req: Request, res: Response) => {
  console.log("delete problem" + req.params.problemId);

  try {
    const deletedProblem = await prisma.problem.delete({
      where: {
        id: +req.params.problemId,
      },
    });
    res.status(200).json(deletedProblem);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
export const createProblem = async (req: Request, res: Response) => {
  try {
    console.log(req.body);

    // return res.status(200).json({ message: "ok" });
    // Connect multiple records: https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#connect-multiple-records
    const newProblem = await prisma.problem.create({
      data: {
        ...req.body,
        tags: {
          connect: req.body.tags.map((tagID: number) => ({
            id: +tagID,
          })),
        },
        starterCodes: {
          create: req.body.starterCodes.map((sc: any) => ({
            lang: sc.lang,
            code: sc.code,
          })),
        },
      },
    });
    res.status(200).json(newProblem);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};

export const getLastSubmission = async (req: Request, res: Response) => {
  try {
    const { problemId } = req.params;
    console.log(req.params);
    const lastSubmission = await prisma.submission.findFirst({
      where: { userId: req.user.userId, problemId: +problemId },
      orderBy: { marks: "desc" },
    });
    console.log(lastSubmission);
    res.status(200).json(lastSubmission);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
