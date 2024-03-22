import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const createFile = async (req: Request, res: Response) => {
  try {
    const { fileName, roomId, code, parentDirId, lang, userId } = req.body;
    const files = await prisma.file.create({
      data: {
        fileName,
        code,
        lang,
        owner: { connect: { id: userId } },
        room: { connect: { id: roomId } },
        parentDir: { connect: { id: parentDirId } },
      },
    });
    res.json(files);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
export const getFile = async (req: Request, res: Response) => {
  const { fileId } = req.params;
  try {
    const files = await prisma.file.findFirst({
      where: {
        id: +fileId,
      },
    });
    res.json(files);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};

export const updateFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const updatedFile = await prisma.file.update({
      where: {
        id: +fileId,
      },
      data: {
        ...req.body,
      },
    });
    res.status(200).json(updatedFile);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "couldnt update file!" });
  }
};
export const deleteFile = async (req: Request, res: Response) => {
  try {
    const deletedFile = await prisma.file.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.status(200).json(deletedFile);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "couldnt delete file!" });
  }
};

export const getAllFiles = async (req: Request, res: Response) => {
  console.log("hi");
  const files = await prisma.file.findMany({
    where: {
      lang: "py",
    },
  });
  res.json(files);
};
