import { Request, Response, Router } from "express";
import { cpp, c, python, java, node } from "compile-run";
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const router = Router();


router.post('/', async (req: Request, res: Response) => {
    const { code, lang, problemId } = req.body;
    console.log(req.body)
    const result = await  evaluateResult(problemId, code, lang)

    res.json(result)
});

const evaluateResult = async (problemId: Number, code: string, lang: string) => {

    try {
        const problem = await prisma.problem.findUnique({
            where: { id: +problemId },
            select: {
                testCases: true
            }
        })
        if (!problem?.testCases) return { message: 'problem not found' }
        //idk why but we need to cast it to an Array
        const testCases = problem.testCases as Array<{ input: string, output: string }>
        const results = await Promise.all(testCases.map(async (testCase) => {
            const { input, output } = testCase
            const result = await runCode(code, lang, input.replaceAll('\\n', '\n'))

            const { stderr } = result
            if (stderr) return { message: stderr }
            return {
                input,
                output,
                actualOutput: result.stdout,
                result,
                isCorrect: verifyOutput(output, result.stdout)
            }
        }))
        const isCorrect = results.every(result => result.isCorrect)
        const passedCount = results.reduce((acc, res)=>acc + (res.isCorrect?1:0),0)
        const totalCount = results.length
        return {
            results,
            passedCount,
            totalCount,
            isCorrect
        }
    } catch (err) {
        console.log(err)
        return { message: 'somethings wrong' }
    }
}

const verifyOutput = (expectedOutput: string, actualOutput: string) => {
    // console.log(expectedOutput.trim().replaceAll(/\t|\n|\r| /g,""), actualOutput.trim().replaceAll(/\t|\n|\r| /g,""))
    return expectedOutput.trim().replaceAll(/\t|\n|\r| /g,"") === actualOutput.trim().replaceAll(/\t|\n|\r| /g,"")
}

const runCode = async (code: string, lang: string, input: string) => {
    console.log("input", input)
    if (lang === 'c')
        return c.runSource(code, { stdin: input })
    if (lang === 'cpp')
        return cpp.runSource(code, { stdin: input })
    if (lang === 'py')
        return python.runSource(code, { stdin: input })
    if (lang === 'java')
        return java.runSource(code, { stdin: input })
    if (lang === 'js')
        return node.runSource(code, { stdin: input })
    return python.runSource(code, { stdin: input })
}


export default router
