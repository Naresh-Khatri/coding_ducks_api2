import { Request, Response, Router } from "express";
import { cpp, c, python, java, node } from "compile-run";

const router = Router();


router.post('/', async (req: Request, res: Response) => {
    const { code, lang } = req.body;
    const output = await runCode(code, lang)
    res.json(output)
});


const runCode = (code: string, lang: string) => {
    if (lang === 'c') {
        return c.runSource(code)
    }
    if (lang === 'cpp') {
        return cpp.runSource(code)
    }
    if (lang === 'py') {
        return python.runSource(code)
    }
    if (lang === 'java') {
        return java.runSource(code)
    }
    if (lang === 'js') {
        return node.runSource(code)
    }
}


export default router
