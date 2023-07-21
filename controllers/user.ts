import { Request, Response } from "express";

import { Prisma, PrismaClient } from "@prisma/client";
import fileUpload from "express-fileupload";
import imageKit from "../imagekit/config";
import { ILeague } from "../types";
const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response) => {
  //get users in order of their submission marks total
  try {
    const submissions = await prisma.submission.findMany({
      distinct: ["userId", "problemId"],
      where: {
        marks: 10,
      },
      select: {
        userId: true,
        marks: true,
        problemId: true,
      },
    });
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullname: true,
        username: true,
        photoURL: true,
        registeredAt: true,
        updatedAt: true,
      },
    });
    //also provide ranks

    const rankedUsers = users
      .map((user) => {
        const userSubmissions = submissions.filter(
          (submission) => submission.userId === user.id
        );
        const totalMarks = userSubmissions.reduce(
          (acc, curr) => acc + curr.marks,
          0
        );
        return { ...user, totalMarks, rank: 1 };
      })
      .sort((a, b) => b.totalMarks - a.totalMarks);

    let rank = 1;
    for (let i = 1; i < rankedUsers.length; i++) {
      if (rankedUsers[i].totalMarks < rankedUsers[i - 1].totalMarks) rank++;
      rankedUsers[i].rank = rank;
    }

    res.json({ data: rankedUsers, message: "success", code: 69 });
  } catch (err) {
    res.status(404).json({ message: "somethings wrong" });
    console.log(err);
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const newUser = await prisma.user.create({
      data: {
        ...req.body,
      },
    });
    res.json(newUser);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return res.status(400).json({ code: 69, message: "User already exists" });
    res.status(404).json({ message: "somethings wrong" });
    console.log(error);
  }
};
export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst({
      where: { googleUID: req.params.gid },
      include: {
        following: {
          select: {
            id: true,
            fullname: true,
            username: true,
            photoURL: true,
            registeredAt: true,
          },
        },
        followedBy: {
          select: {
            id: true,
            fullname: true,
            username: true,
            photoURL: true,
            registeredAt: true,
          },
        },
      },
    });
    res.json(user || []);
  } catch (err) {
    res.status(404).json({ message: "somethings wrong" });
    console.log(err);
  }
};
//TODO: this function need some optimization
export const getUserUsingUsername = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst({
      where: { username: { equals: req.params.username, mode: "insensitive" } },
      include: {
        followedBy: {
          select: {
            id: true,
            fullname: true,
            username: true,
            photoURL: true,
            registeredAt: true,
          },
        },
        following: {
          select: {
            id: true,
            fullname: true,
            username: true,
            photoURL: true,
            registeredAt: true,
          },
        },
      },
    });
    if (!user) return res.status(404).json({ message: "user not found" });

    res.json({ data: user, message: "success", code: 69 });
  } catch (err) {
    res.status(404).json({ message: "somethings wrong" });
    console.log(err);
  }
};
export const updateUser = async (req: Request, res: Response) => {
  try {
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { ...req.body },
    });
    const user = await prisma.user.findFirst({
      where: { id: req.user.userId },
      include: {
        following: {
          select: {
            id: true,
            fullname: true,
            username: true,
            photoURL: true,
            registeredAt: true,
          },
        },
        followedBy: {
          select: {
            id: true,
            fullname: true,
            username: true,
            photoURL: true,
            registeredAt: true,
          },
        },
      },
    });
    res.json(user);
  } catch (err) {
    res.status(404).json({ message: "somethings wrong" });
    console.log(err);
  }
};
export const checkUsername = async (req: Request, res: Response) => {
  const { username } = req.body;
  const user = await prisma.user.findFirst({ where: { username: username } });
  res.json({ available: !!!user });
};

export const followUser = async (req: Request, res: Response) => {
  try {
    const { fromUser, toUser } = req.body;
    await prisma.user.update({
      where: { id: fromUser },
      data: {
        following: {
          connect: {
            id: toUser,
          },
        },
      },
    });
    await prisma.user.update({
      where: { id: toUser },
      data: {
        followedBy: {
          connect: {
            id: fromUser,
          },
        },
      },
    });

    res.status(200).json({ message: "success" });
  } catch (err) {
    res.status(404).json({ message: "somethings wrong" });
    console.log(err);
  }
};

export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const { fromUser, toUser } = req.body;
    await prisma.user.update({
      where: { id: fromUser },
      data: {
        following: {
          disconnect: {
            id: toUser,
          },
        },
      },
    });
    await prisma.user.update({
      where: { id: toUser },
      data: {
        followedBy: {
          disconnect: {
            id: fromUser,
          },
        },
      },
    });
    res.status(200).json({ message: "success" });
  } catch (err) {
    res.status(404).json({ message: "somethings wrong" });
    console.log(err);
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: req.params.username,
          mode: "insensitive",
        },
      },
      include: {
        Submission: {
          distinct: "problemId",
          orderBy: {
            timestamp: "desc",
          },
          select: {
            problemId: true,
            Problem: { select: { difficulty: true } },
            marks: true,
            lang: true,
            timestamp: true,
            isAccepted: true,
            Exam: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    });
    ``;
    if (!user) return res.status(404).json({ message: "user not found" });
    const result: any =
      await prisma.$queryRaw`SELECT timestamp::date, COUNT(*)::int
FROM "Submission"
WHERE "userId" = ${user.id}
GROUP BY timestamp::date
ORDER BY timestamp::date ASC;`;

    // ----------------- DAILY SUBMISSIONS -----------------
    const dailySubmissions = result.map((sub: any) => {
      return {
        date: sub.timestamp.toISOString().split("T")[0],
        count: sub.count,
      };
    });

    // ----------------- SUBMISSIONS BY EXAM -----------------
    const newSub = user?.Submission.reduce((acc, sub) => {
      const examId = sub.Exam.id;
      if (acc[examId] == null) acc[examId] = [];
      acc[examId].push({
        slug: sub.Exam.slug,
        title: sub.Exam.title,
        problemId: sub.problemId,
      });
      return acc;
    }, {} as any);

    // ----------------- TOTAL SUBMISSIONS -----------------
    const totalSubCount = user.Submission.length;

    // ----------------- PROBLEMS SOLVED -----------------
    const totalProblemsSolved = Object.keys(
      user.Submission.reduce((acc, curr) => {
        if (acc[curr.problemId] == null && curr.isAccepted === true)
          acc[curr.problemId] = true;
        return acc;
      }, {} as any)
    ).length;

    // ----------------- ACCURACY -----------------
    const accuracy = ((totalProblemsSolved / totalSubCount) * 100).toFixed(1);

    // ----------------- POINTS -----------------
    const points = user.Submission.reduce((curr, agg) => {
      const diff = agg.Problem.difficulty;
      const point =
        diff === "tutorial"
          ? 1
          : diff === "easy"
          ? 2
          : diff === "medium"
          ? 3
          : 4;
      return curr + point;
    }, 0);

    // ----------------- LEAGUE -----------------
    const league: ILeague = (() => {
      if (points < 25) return "noob";
      else if (points < 100) return "beginner";
      else if (points < 200) return "intermediate";
      else if (points < 300) return "advance";
      else if (points < 400) return "expert";
      else if (points < 500) return "master";
      else return "grandmaster";
    })();

    // ----------------- STREAK -----------------
    // should start from current date
    const streak = dailySubmissions.reduce((curr: any, agg: any) => {
      if (curr.length === 0) {
        curr.push([agg]);
        return curr;
      }
      const lastSub = curr[curr.length - 1][curr[curr.length - 1].length - 1];
      const lastSubDate = new Date(lastSub.date);
      const currSubDate = new Date(agg.date);
      const diff = Math.abs(
        Math.floor((currSubDate.getTime() - lastSubDate.getTime()) / 86400000)
      );
      if (diff === 1) {
        curr[curr.length - 1].push(agg);
      } else {
        curr.push([agg]);
      }
      return curr;
    }, []);

    const longestStreak = streak.reduce(
      (curr: any, agg: any) => (curr.length > agg.length ? curr : agg),
      []
    );

    res.status(200).json({
      data: {
        streak,
        longestStreak,
        totalProblemsSolved,
        totalSubCount,
        league,
        points,
        accuracy,
        dailySubmissions,
        byExamId: newSub,
      },
      message: "success",
      code: 69,
    });
  } catch (err) {
    res.status(404).json({ message: "somethings wrong" });
    console.log(err);
  }
};
export const uploadProfilePicture = async (req: Request, res: Response) => {
  const { userId } = req.user;
  if (!req.files || Object.keys(req.files).length === 0)
    return res.status(404).json({ message: "cover image not uploaded" });

  const newProfilePicture = req.files
    .newProfilePicture as fileUpload.UploadedFile;
  const fileName = `${userId}-${Date.now}`;
  try {
    const result = await imageKit.upload({
      file: newProfilePicture.data,
      fileName: fileName,
      folder: "/coding_ducks/profile_pictures/",
      extensions: [
        { name: "google-auto-tagging", maxTags: 5, minConfidence: 95 },
      ],
    });
    console.log(result);
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        photoURL: result.url,
      },
    });
    res.status(200).json(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
