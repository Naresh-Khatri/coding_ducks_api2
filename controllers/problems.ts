import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllProblems = async (req: Request, res: Response) => {
  try {
    const problemsList = await prisma.problem.findMany({
      orderBy: {
        order: "asc",
      },
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
export const getExamProblems = async (req: Request, res: Response) => {
  try {
    const problemsList = await prisma.problem.findMany({
      where: {
        examId: +req.params.examId,
      },
      orderBy: {
        order:'asc'
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
    const newProblem = await prisma.problem.create({
      data: req.body,
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
