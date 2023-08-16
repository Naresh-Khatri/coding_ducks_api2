import { Request, Response, Router } from "express";
import { cpp, c, python, java, node } from "compile-run";
import { PrismaClient } from "@prisma/client";
import { checkIfAuthenticated } from "../middlewares/auth-middleware";
import { ISubmissionResult, ITestCase, Lang } from "../types";
const prisma = new PrismaClient();

const router = Router();

router.post(
  "/",
  [checkIfAuthenticated],
  async (req: Request, res: Response) => {
    const { code, lang, problemId } = req.body;
    try {
      const result = await evaluateResult(problemId, code, lang);
      if (req.body.submit) await saveInDB(result, req);

      res.json(result);
    } catch (err) {
      console.log("err in saldkfj", err);
      res.status(404).json({ message: "somethings wrong" });
    }
  }
);

const evaluateResult = async (problemId: Number, code: string, lang: Lang) => {
  return new Promise(async (resolve, reject) => {
    try {
      const problem = await prisma.problem.findUnique({
        where: { id: +problemId },
      });
      if (!problem?.testCases) return reject({ message: "problem not found" });

      // grab test cases
      const testCases = problem.testCases as unknown as ITestCase[];

      // run code for each test case
      const results = await Promise.all(
        testCases.map(async (testCase) => {
          const { input, output } = testCase;
          // add \n at the end to avoid \r
          const result = await runCode(
            code,
            lang,
            input.replaceAll("\\n", "\n") + "\n"
          );
          const { stderr, errorType } = result;
          if (stderr) {
            const errorIndex = getErrorIndex(stderr, lang);
            return {
              errorOccurred: true,
              errorMessage: stderr,
              errorType,
              errorIndex,
            };
          }
          if (testCase.isPublic)
            return {
              input,
              output,
              actualOutput: result.stdout,
              result,
              isPublic: true,
              isCorrect: verifyOutput(output, result.stdout),
            };
          else
            return {
              result,
              isPublic: false,
              isCorrect: verifyOutput(output, result.stdout),
            };
        })
      );
      const isCorrect = results.every((result) => result.isCorrect);
      const passedCount = results.reduce(
        (acc, res) => acc + (res.isCorrect ? 1 : 0),
        0
      );
      const totalCount = results.length;
      resolve({
        results,
        passedCount,
        totalCount,
        isCorrect,
      } as ISubmissionResult);
    } catch (err) {
      console.log(err);
      reject({ message: "somethings wrong" });
    }
  });
};

const getErrorIndex = (stderr: string, lang: Lang) => {
  if (lang === "py") {
    const idx = stderr.indexOf("line ");
    const text = stderr.substring(idx, idx + 10);
    const line = Number.parseInt(text.split(" ")[1]);
    return line;
  }
  return 0;
};

// this also adds subId to result
const saveInDB = async (result: any, req: Request) => {
  return new Promise<void>(async (resolve, reject) => {
    // increment user's point if its first accepted submission
    const previousAcceptedSubs = await prisma.submission.count({
      where: {
        userId: req.user.userId,
        problemId: req.body.problemId,
        isAccepted: true,
      },
    });

    // add points to user table
    if (previousAcceptedSubs === 0) {
      const problem = await prisma.problem.findUnique({
        where: {
          id: req.body.problemId,
        },
        select: {
          difficulty: true,
        },
      });
      const diff = problem?.difficulty;
      const pointsToAdd =
        diff === "tutorial" || diff === "veryEasy"
          ? 1
          : diff === "easy"
          ? 2
          : diff === "medium"
          ? 3
          : 4;
      await prisma.user.update({
        where: {
          id: req.user.userId,
        },
        data: {
          points: {
            increment: pointsToAdd,
          },
        },
      });
    }

    // add submission to db
    const submission = await prisma.submission.create({
      data: {
        code: req.body.code,
        lang: req.body.lang,
        userId: req.user.userId,
        total_tests: result.totalCount,
        tests_passed: result.passedCount,
        marks: result.totalCount === result.passedCount ? 10 : 0,
        isAccepted: result.totalCount === result.passedCount,
        examId: req.body.examId,
        problemId: req.body.problemId,
        tests: result.results,
      },
    });
    result.submissionId = submission.id;

    // check if this user has completed all problems of 'tutorial' diffLevel
    if (req.user.isNoob) {
      const subs = await prisma.submission.findMany({
        distinct: ["problemId"],
        where: {
          userId: req.user.userId,
          marks: 10,
          Problem: {
            difficulty: "tutorial",
          },
        },
      });
      if (subs.length === 10)
        await prisma.user.update({
          where: { id: req.user.userId },
          data: { isNoob: false },
        });

      result.tutorialProblemsSolved = subs.length;
    }

    resolve();
  });
};

const verifyOutput = (expectedOutput: string, actualOutput: string) => {
  // console.log(expectedOutput.trim().replaceAll(/\t|\n|\r| /g,""), actualOutput.trim().replaceAll(/\t|\n|\r| /g,""))
  return (
    expectedOutput?.trim().replaceAll(/\t|\n|\r| /g, "") ===
    actualOutput?.trim().replaceAll(/\t|\n|\r| /g, "")
  );
};

const runCode = async (code: string, lang: string, input: string) => {
  // console.log("input", input)
  if (lang === "c")
    return c.runSource(code, {
      stdin: input,
      stderrLimit: 10000,
      stdoutLimit: 10000,
    });
  if (lang === "cpp")
    return cpp.runSource(code, {
      stdin: input,
      stderrLimit: 10000,
      stdoutLimit: 10000,
    });
  if (lang === "py")
    return python.runSource(code, {
      stdin: input,
      stderrLimit: 10000,
      stdoutLimit: 10000,
    });
  if (lang === "java")
    return java.runSource(code, {
      stdin: input,
      stderrLimit: 10000,
      stdoutLimit: 10000,
    });
  if (lang === "js")
    return node.runSource(code, {
      stdin: input,
      stderrLimit: 10000,
      stdoutLimit: 10000,
    });
  return python.runSource(code, { stdin: input });
};

export default router;
