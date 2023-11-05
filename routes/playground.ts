import { Request, Response, Router } from "express";
import { checkIfAuthenticated } from "../middlewares/auth-middleware";

import { Lang } from "../types";
import { execCode } from "../turbodrive";
import prisma from "../lib/prisma";

const router = Router();

router.post(
  "/",
  [checkIfAuthenticated],
  async (req: Request, res: Response) => {
    const { code, lang } = req.body;
    const inputs = req.body.inputs || [""];
    try {
      // Deterministically run garbage collector
      if (global.gc) global.gc();

      const startMemory = process.memoryUsage().heapUsed;
      const result = await execCode({
        lang,
        code,
        inputs,
        options: { maxBuffer: 1024 * 1024, timeout: 3000 },
      });
      res.json({
        ...result,
        memory: ((process.memoryUsage().heapUsed - startMemory) / 1024).toFixed(
          2
        ),
      });
    } catch (err) {
      console.log("err in saldkfj", err);
      res.status(404).json({ message: "somethings wrong" });
    }
  }
);
router.get("/rooms", async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany();
    res.status(200).json(rooms);
  } catch (err) {
    console.log("err in saldkfj", err);
    res.status(404).json({ message: "somethings wrong" });
  }
});

export const runCode = async (code: string, lang: Lang, inputs: string[]) => {
  return execCode({
    lang,
    code,
    inputs,
    options: { maxBuffer: 1024 * 1024 },
  });
  // console.log("input", input)
};

export default router;
