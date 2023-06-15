import { Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllProblems = async (req: Request, res: Response) => {
  try {
    const problemsList = await prisma.problem.findMany({
      orderBy: [
        {
          id: "desc",
        },
      ],

      include: {
        exam: {
          select: {
            slug: true,
            title: true,
          },
        },
      },
    });
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

export const getProblemsForProblemPage = async (
  req: Request,
  res: Response
) => {
  const { query } = req;
  const { q, sortBy, orderBy, skip, limit } = query;
  console.log(query);
  try {
    const queryObj: Prisma.ProblemFindManyArgs = {
      select: {
        id: true,
        title: true,
        // slug: true,
        difficulty: true,
        tags: true,
      },
    };
    if (q)
      queryObj.where = { ...queryObj.where, title: { contains: q as string } };
    if (sortBy)
      queryObj.orderBy = { [sortBy as string]: orderBy as Prisma.SortOrder };

    if (skip) queryObj.skip = +skip;
    if (limit) queryObj.take = +limit;
    const data = await prisma.problem.findMany(queryObj);
    const problemsList = data.map((problem) => {
      return {
        ...problem,
        slug: problem.title.replace(/\s+/g, "-").toLowerCase(),
      };
    });

    const count = await prisma.problem.count();

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
export const updateProblem = async (req: Request, res: Response) => {
  try {
    const updatedProblem = await prisma.problem.update({
      where: {
        id: +req.params.problemId,
      },
      data: req.body,
    });
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
    // Connect multiple records: https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries#connect-multiple-records
    const newProblem = await prisma.problem.create({
      data: {
        ...req.body,
        tags: {
          connect: req.body.tags.map((tagID: any) => ({
            id: +tagID,
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
