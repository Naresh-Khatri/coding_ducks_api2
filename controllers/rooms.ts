import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const createRoom = async (req: Request, res: Response) => {
  try {
    const newRoom = await prisma.file.create({
      data: {
        ...req.body,
        owner: { connect: { id: req.body.userId } },
      },
    });
    res.json(newRoom);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
export const getAllRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany({});
    res.json(rooms);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
export const getPublicRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany({
      where: { isPublic: true },
      include: {
        owner: { select: { id: true, username: true, photoURL: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    // Todo: yet to decide response format
    res.json({ status: "success", data: rooms });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};

export const getRoom = async (req: Request, res: Response) => {
  const { roomId } = req.params;
  try {
    const room = await prisma.room.findFirst({
      where: {
        id: +roomId,
      },
      include: {
        allowedUsers: {
          select: { id: true, username: true, photoURL: true, fullname: true },
        },
        owner: {
          select: { id: true, username: true, photoURL: true, fullname: true },
        },
      },
    });
    res.json(room);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
export const getRoomWithName = async (req: Request, res: Response) => {
  const { roomname } = req.params;
  try {
    const room = await prisma.room.findFirst({
      where: {
        name: roomname,
      },
      include: {
        allowedUsers: {
          select: { id: true, username: true, photoURL: true, fullname: true },
        },
        owner: {
          select: { id: true, username: true, photoURL: true, fullname: true },
        },
      },
    });
    res.json(room);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};

// following 2 are almost same
export const updateAllowList = async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { userId, op } = req.body;
  try {
    const room = await prisma.room.update({
      where: {
        id: +roomId,
      },
      data: {
        allowedUsers: {
          [op === "add" ? "connect" : "disconnect"]: { id: +userId },
        },
      },
    });
    res.json(room);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
export const updateRoom = async (req: Request, res: Response) => {
  const { roomId } = req.params;
  try {
    const room = await prisma.room.update({
      where: {
        id: +roomId,
      },
      data: {
        ...req.body,
      },
    });
    res.json(room);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
export const updateRoomContents = async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { head, html, css, js } = req.body;
  try {
    const room = await prisma.room.update({
      where: {
        id: +roomId,
      },
      data: {
        contentHEAD: head,
        contentHTML: html,
        contentCSS: css,
        contentJS: js,
      },
    });
    res.json(room);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
export const deleteRoom = async (req: Request, res: Response) => {
  const { roomId } = req.params;
  try {
    const room = await prisma.room.delete({
      where: {
        id: +roomId,
      },
    });
    res.json(room);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
