import { ExecException } from "child_process";
import { writeSourceFile } from "./lib/utls";
import { compileCpp, compileJava } from "./compilers";
import { execute } from "./executors";
import { Lang } from "../types";

interface IRunOptions {
  lang: Lang;
  code: string;
  inputs: string[];
  options?: { timeout?: number; maxBuffer?: number };
}
export interface IRunResult {
  stdout: string;
  stdin?: string | null;
  stderr?: string;
  exitCode: number;
  memoryUsage?: number;
  runtime?: number;
  signal?: string | null;
  errorType?:
    | "compile-time"
    | "run-time"
    | "pre-compile-time"
    | "run-timeout"
    | "segmentation-error"
    | null;
  isPublic?: boolean;
  isCorrect?: boolean;
  expectedOutput?: string;
  output?: string;
}
export interface ICompilationResult {
  compileErr: ExecException | null;
  compileStdout: string;
  compileStderr: string;
  compileSuccess: boolean;
  compileTime: number;
}
interface IExecResult extends ICompilationResult {
  errorsCount?: number;
  total?: number;
  totalRuntime?: number;
  results?: IRunResult[];
}
export const execCode = async ({
  lang,
  code,
  inputs,
  options,
}: IRunOptions): Promise<IExecResult> =>
  // Promise<ICompilationResult | (IRunResult | null)[]>
  {
    return new Promise(async (resolve, reject) => {
      try {
        let compResult;
        let sourcePath: string;
        if (lang === "js") {
          const { filePath, dirPath } = await writeSourceFile(code, "js");
          sourcePath = dirPath;
        } else if (lang === "py") {
          const { filePath, dirPath } = await writeSourceFile(code, "py");
          sourcePath = dirPath;
        } else if (lang === "java") {
          const { filePath, dirPath } = await writeSourceFile(code, "java");
          sourcePath = filePath;
          compResult = await compileJava({ dirPath, filePath });
        } else {
          const { filePath, dirPath } = await writeSourceFile(code, "cpp");
          sourcePath = dirPath;
          compResult = await compileCpp(dirPath);
        }
        if (compResult?.compileErr) {
          //TODO: this is a temporary hack for codemacha3.0
          console.log(Object.entries(compResult));
          const res: ICompilationResult = compResult;
          return resolve({
            total: inputs.length,
            errorsCount: inputs.length,
            compileErr: { name: "", message: "" },
            compileStderr: compResult.compileStderr,
            compileStdout: compResult.compileStderr,
            compileSuccess: false,
            compileTime: 0,
            results: inputs.map((input) => {
              return {
                errorType: "compile-time",
                stdout: res.compileStderr,
                exitCode: 1,
              };
            }),
          });
        }
        const promises = inputs.map(
          async (input) =>
            await execute({ lang, dirPath: sourcePath, input, options })
        );
        // we start measuring for totalRuntime only when promises are made
        // this is becase js is a fucking slow language and is interfering with
        // exec times, we dont include the time to create promises
        const start = performance.now();
        const execResults = await Promise.allSettled(promises);
        const totalRuntime = +(performance.now() - start).toFixed(3);
        resolve({
          ...compResult,
          total: inputs.length,
          errorsCount: execResults.reduce(
            (agg, curr) =>
              curr.status === "rejected" || curr.value.errorType
                ? agg + 1
                : agg,
            0
          ),
          totalRuntime,
          results:
            execResults.map(
              (res): IRunResult =>
                res.status === "rejected"
                  ? { exitCode: 1, stdout: "" }
                  : res.value
            ) || [],
        } as IExecResult);
      } catch (err) {
        console.log(err);
      }
    });
  };
