import { Request, Response, Router } from "express";
import { cpp, c, python, java, node } from "compile-run";
import { PrismaClient } from '@prisma/client'
import { checkIfAuthenticated } from "../middlewares/auth-middleware";
const prisma = new PrismaClient()

const router = Router();

interface Result {
    results: Array<{ input: string, output: string, actualOutput: string, result: any, isCorrect: boolean }>,
    passedCount: number,
    totalCount: number,
    isCorrect: boolean
}

router.post('/', [checkIfAuthenticated], async (req: Request, res: Response) => {
    const { code, lang, problemId } = req.body;
    // console.log(req.body)
    try {


        const result = await evaluateResult(problemId, code, lang) as Result
        if (req.body.submit)
            await saveInDB(result, req)

        res.json(result)
    } catch (err) {
        console.log('err in saldkfj', err)
        res.status(404).json({ message: 'somethings wrong' })
    }
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
            if (stderr) return { errorOccurred: true, errorMessage: stderr }
            return {
                input,
                output,
                actualOutput: result.stdout,
                result,
                isCorrect: verifyOutput(output, result.stdout)
            }
        }))
        const isCorrect = results.every(result => result.isCorrect)
        const passedCount = results.reduce((acc, res) => acc + (res.isCorrect ? 1 : 0), 0)
        const totalCount = results.length

        // save submission in db
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
const saveInDB = async (result: Result, req: Request) => {
    return new Promise<void>(async (resolve, reject) => {
        // console.log(req.user)
        const submission = await prisma.submission.create({
            data: {
                code: req.body.code,
                lang: req.body.lang,
                user_id: req.user.user_id,
                total_tests: result.totalCount,
                tests_passed: result.passedCount,
                marks: result.totalCount === result.passedCount ? 10 : 0,
                examId: req.body.examId,
                problemId: req.body.problemId,
                tests: result.results
            },
        })
        // console.log('saved in db', submission)
        resolve()
    })
}

const verifyOutput = (expectedOutput: string, actualOutput: string) => {
    // console.log(expectedOutput.trim().replaceAll(/\t|\n|\r| /g,""), actualOutput.trim().replaceAll(/\t|\n|\r| /g,""))
    return expectedOutput.trim().replaceAll(/\t|\n|\r| /g, "") === actualOutput.trim().replaceAll(/\t|\n|\r| /g, "")
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
