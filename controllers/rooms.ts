import { Request, Response } from "express";
import prisma from "../lib/prisma";
import nodeHtmlToImage from "node-html-to-image";
import imageKit from "../imagekit/config";

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { name, description, isPublic } = req.body;
    const { userId } = req.user;

    const newRoom = await prisma.room.create({
      data: { name, description, isPublic, owner: { connect: { id: userId } } },
    });
    return res.status(200).json({ message: "success", data: newRoom });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
export const getAllRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany();
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
    if (req.roomRole === "requester") {
      return res.json({ room: { id: +roomId }, role: "requester" });
    }
    res.json({ room, role: req.roomRole });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
export const getRoomMsgs = async (req: Request, res: Response) => {
  const { roomId } = req.params;
  try {
    const msgs = await prisma.message.findMany({
      where: {
        roomId: +roomId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const foo = msgs.map((msg) => ({
      user: {
        id: msg.userId,
        username: msg.username,
        photoURL: msg.photoURL,
      },
      room: { id: msg.roomId },
      text: msg.text,
      updatedAt: msg.updatedAt,
      time: msg.updatedAt,
    }));
    res.json({ data: foo || [] });
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
    updatePreviewImage({ html, css, js, head }, +roomId);
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

const updatePreviewImage = async (
  template: { html: string; css: string; js: string; head: string },
  roomId: number
) => {
  const { css, head, html, js } = template;
  const htmlTemplate = `<html><head>${head}</head>
  <body>${html}</body>
  <style>${css}</style>
  <style>body{width:1280px; height: 720px; margin: 0; overflow: hidden;}</style>
  <script>${js}</script>
</html>`;

  const image: Buffer = (await nodeHtmlToImage({
    html: htmlTemplate,
  })) as Buffer;
  try {
    await imageKit.createFolder({
      parentFolderPath: "/coding_ducks/ducklet_previews",
      folderName: String(roomId),
    });

    const result = await imageKit.upload({
      file: image,
      fileName: Date.now().toString(),
      useUniqueFileName: false,
      folder: "/coding_ducks/ducklet_previews/" + roomId,
    });
    await prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        previewImage: result.url,
      },
    });
  } catch (err) {
    console.log(err);
  }
};
