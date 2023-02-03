import { Request, Response, Router } from "express";
import { cpp, c, python, java, node } from "compile-run";
import { checkIfAuthenticated } from "../middlewares/auth-middleware";

const router = Router();

router.post(
  "/",
  [checkIfAuthenticated],
  async (req: Request, res: Response) => {
    const { code, lang } = req.body;
    const input = req.body.input || "";
    try {
      const result = await runCode(code, lang, input);
        console.log(result)
      res.json(result);
    } catch (err) {
      console.log("err in saldkfj", err);
      res.status(404).json({ message: "somethings wrong" });
    }
  }
);

const runCode = async (code: string, lang: string, input: string) => {
  // console.log("input", input)
  if (lang === "c") return c.runSource(code, { stdin: input });
  if (lang === "cpp") return cpp.runSource(code, { stdin: input });
  if (lang === "py") return python.runSource(code, { stdin: input });
  if (lang === "java") return java.runSource(code, { stdin: input });
  if (lang === "js") return node.runSource(code, { stdin: input });
  return python.runSource(code, { stdin: input });
};

export default router;
