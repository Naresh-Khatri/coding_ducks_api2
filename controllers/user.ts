import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import fileUpload from "express-fileupload";
import imageKit from "../imagekit/config";
import { ILeague } from "../types";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullname: true,
        username: true,
        photoURL: true,
        points: true,
        updatedAt: true,
      },
      orderBy: {
        points: "desc",
      },
    });
    //also provide ranks
    const rankedUsers = users.map((u, idx) => {
      return { ...u, rank: idx + 1 };
    });

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

export const getSearchUser = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: req.params.username, mode: "insensitive" } },
          { fullname: { contains: req.params.username, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        fullname: true,
        username: true,
        photoURL: true,
      },
    });
    if (!users) return res.status(404).json({ message: "users not found" });

    res.json({ data: users, message: "success", code: 69 });
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
      select: {
        id: true,
        bio: true,
        fullname: true,
        username: true,
        isAdmin: true,
        isNoob: true,
        lastLoginAt: true,
        points: true,
        registeredAt: true,
        photoURL: true,
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
      select: {
        id: true,
        username: true,
        points: true,
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

    // ----------------- DAILY SUBMISSIONS -----------------
    const allSubmissions = await prisma.submission.findMany({
      where: { userId: user.id },
      select: {
        timestamp: true,
        examId: true,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    const dailySubmissions = allSubmissions.reduce((acc, curr) => {
      const date = curr.timestamp.toISOString().split("T")[0];
      if (acc.length === 0) {
        acc.push({ date, count: 1, examId: curr?.examId });
        return acc;
      }
      const lastSub = acc[acc.length - 1];
      if (lastSub.date === date) {
        lastSub.count += 1;
      } else {
        acc.push({ date, count: 1, examId: curr?.examId });
      }
      return acc;
    }, [] as { date: string; count: number; examId: number | null }[]);

    // ----------------- STREAK -----------------
    const subsCountByDate = allSubmissions.reduce((agg: any, currSub: any) => {
      const date = currSub.timestamp.toISOString().split("T")[0];

      if (agg.length === 0) {
        agg.push({ date, count: 1 });
        return agg;
      }
      if (agg[agg.length - 1]?.date === date) agg[agg.length - 1].count++;
      else agg.push({ date, count: 1 });
      return agg;
    }, [] as { date: string; count: number }[]);
    interface IDateCount {
      date: string;
      count: number;
    }
    type Streak = IDateCount[];

    function calculateStreaks(dateObjects: IDateCount[]): {
      streaks: Streak[];
      longestStreak: number;
      streakActive: boolean;
    } {
      // Convert date strings to Date objects
      const dates: Date[] = dateObjects.map(
        (dateObj) => new Date(dateObj.date)
      );

      const streaks: Streak[] = [];
      let currentStreak: Streak = [];

      for (let i = 0; i < dates.length; i++) {
        const diffInMilliseconds: number =
          i > 0 ? dates[i - 1].getTime() - dates[i].getTime() : 0;

        if (diffInMilliseconds === 86400000) {
          // 86400000 milliseconds = 1 day
          currentStreak.push(dateObjects[i]);
        } else {
          if (currentStreak.length > 1) {
            streaks.push(currentStreak);
          }
          currentStreak = [dateObjects[i]];
        }
      }

      // Check the last streak
      if (currentStreak.length > 1) {
        streaks.push(currentStreak);
      }

      const longestStreak = Math.max(...streaks.map((streak) => streak.length));
      const streakActive = streaks?.at(-1)?.at(-1)
        ? streaks.at(-1)?.at(-1)?.date ===
          new Date().toISOString().split("T")[0]
        : false;
      return { streakActive, streaks, longestStreak };
    }

    // console.log(allSubmissions)
    const { streaks, longestStreak, streakActive } =
      calculateStreaks(subsCountByDate);

    // ----------------- SUBMISSIONS BY EXAM -----------------
    const newSub = user?.Submission.reduce((acc, sub) => {
      if (sub.Exam == null) return acc;
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
        if (
          acc[curr.problemId] == null &&
          !curr.Exam &&
          curr.isAccepted === true
        ) {
          acc[curr.problemId] = true;
        }
        return acc;
      }, {} as any)
    ).length;

    // ----------------- ACCURACY -----------------
    const accuracy = ((totalProblemsSolved / totalSubCount) * 100).toFixed(1);

    // ----------------- POINTS -----------------
    const points = user.points;

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

    // ----------------- RANK -----------------
    const rankedUsers = await prisma.user.findMany({
      select: {
        id: true,
        points: true,
      },
      orderBy: {
        points: "desc",
      },
    });
    const rank = rankedUsers.findIndex((u) => u.id === user.id) + 1;

    // ----------------- CALCULATE RANK OF USER-----------------

    res.status(200).json({
      data: {
        rank,
        streaks,
        longestStreak,
        streakActive,
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
    // console.log(result);
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

export const getUserRooms = async (req: Request, res: Response) => {
  const { userId } = req.params;
  console.log(userId);

  try {
    const rooms = await prisma.room.findMany({
      where: {
        ownerId: +userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    res.status(200).json(rooms);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
