// import { ExecException, exec } from "child_process";
// import { Lang } from "../../types";
// import { writeSourceFile } from "./utls";

// interface IRunOptions {
//   lang: Lang;
//   code: string;
//   input?: string;
//   options: {
//     timeout?: number;
//     maxBuffer?: number;
//   };
// }
// export interface IRunResult {
//   stdout: string;
//   stdin?: string;
//   stderr?: string;
//   exitCode: number;
//   memoryUsage?: number;
//   compileTime?: number;
//   runtime?: number;
//   signal?: string | null;
//   errorType?:
//     | "compile-time"
//     | "run-time"
//     | "pre-compile-time"
//     | "run-timeout"
//     | "segmentation-error"
//     | null;
// }
// const initRes: IRunResult = {
//   stdout: "",
//   stdin: "",
//   stderr: "",
//   exitCode: 0,
//   memoryUsage: 0,
//   runtime: 0,
//   compileTime: 0,
//   signal: null,
// };

// // export const execCode = async ({
// //   lang,
// //   code,
// //   inputs,
// // }: IRunOptions2): Promise<object> =>
// //   // Promise<ICompilationResult | (IRunResult | null)[]>
// //   {
// //     return new Promise(async (resolve, reject) => {
// //       let result: IRunResult = {
// //         stdout: "",
// //         stderr: "",
// //         exitCode: 0,
// //         runtime: 0,
// //         signal: null,
// //         memoryUsage: 0,
// //         compileTime: 0,
// //         errorType: null,
// //       };

// //       if (lang === "c" || lang === "cpp") {
// //         const { filePath, dirPath } = await writeSourceFile(code, "cpp");
// //         const compResult = (await compileGcc(dirPath)) as ICompilationResult;
// //         // result = { ...result, ...compResult};

// //         if (compResult.err) return resolve(compResult);

// //         const promises = inputs.map(
// //           async (input) => await executeCpp({ dirPath, input: input })
// //         );

// //         const execResults = await Promise.allSettled(promises);

// //         resolve({
// //           compileTime: compResult.compileTime,
// //           total: inputs.length,
// //           passed: execResults.reduce(
// //             (agg, curr) => (curr.status === "fulfilled" ? agg + 1 : agg),
// //             0
// //           ),
// //           longestRuntime: execResults.reduce((agg, curr) => {
// //             if (curr.status === "rejected") return agg;
// //             else {
// //               if (curr.value.runtime && curr.value.runtime > agg) {
// //                 return curr.value.runtime;
// //               } else return agg;
// //             }
// //           }, 0),

// //           results: execResults.map((res) =>
// //             res.status === "rejected" ? null : res.value
// //           ),
// //         });
// //       }
// //     });
// //   };
// // export const execCodeWithSingleInput = async ({
// //   lang,
// //   code,
// //   input,
// //   options,
// // }: IRunOptions): Promise<IRunResult> => {
// //   let result = initRes;
// //   const { filePath, dirPath } = await writeSourceFile(code, lang);

// //   return new Promise((resolve, reject) => {
// //     exec(
// //       `${__dirname}/../run${lang}.sh "${dirPath}" "${input}"`,
// //       { ...options, shell: "/bin/bash", timeout: options.timeout || 4000 },
// //       (err: ExecException | null, stdout: string, stderr: string) => {
// //         // console.log("err", Object.entries(err || {}));
// //         // console.log("stdout", stdout);
// //         if (stdout.includes("|~|")) {
// //           const perfData = stdout.split("|~|")[1].split("\n");
// //           result = {
// //             ...result,
// //             compileTime: parseInt(perfData[0]),
// //             runtime: parseInt(perfData[1]),
// //             memoryUsage: parseFloat(perfData[2]),
// //           };
// //         }
// //         if (err) {
// //           // console.log(JSON.stringify(err));
// //           if (err.code == 1) result.stderr = stdout.split("|~|")[0];
// //           result = {
// //             ...result,
// //             signal: err.signal || null,
// //             exitCode: err.code || 1,
// //             errorType: err.code === 1 ? "run-time" : "compile-time",
// //           };

// //           if (err.signal === "SIGTERM") result.errorType = "run-timeout";
// //           result.stderr = stdout.split("|~|")[0];
// //           // console.log(err);
// //         } else if (stdout) {
// //           // console.log(stdout, "stdout");
// //           const outputText = stdout.split("|~|")[0];

// //           result.stdout = outputText;
// //         }
// //         if (stderr) {
// //           // console.log(stderr, "stderr");
// //           result = {
// //             ...result,
// //             stderr: stderr,
// //             errorType: "run-time",
// //             exitCode: 1,
// //             runtime: 0,
// //             memoryUsage: 0,
// //           };
// //         }
// //         resolve(result);
// //       }
// //     );
// //   });
// // };
