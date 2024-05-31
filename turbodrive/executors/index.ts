import { spawn } from "child_process";
import { Lang } from "../../types";
import { IRunResult } from "..";

export const execute = async ({
  lang,
  dirPath,
  input,
  options,
}: {
  lang: Lang;
  dirPath: string;
  input: string;
  options?: { timeout?: number };
}): Promise<IRunResult> => {
  let result: IRunResult = {
    stdout: "",
    stderr: "",
    exitCode: 0,
    runtime: 0,
    signal: null,
  };
  return new Promise(async (resolve, reject) => {
    let c;
    let start = performance.now();
    if (lang === "java") {
      // in case of java we get the entire path for object code
      // file to run as `dirPath`
      const className = dirPath.split("/").at(-1);
      dirPath = dirPath.split("/").slice(0, -1).join("/");
      start = performance.now();
      c = spawn("java", [`-cp`, dirPath, className || ""], {
        ...options,
        cwd: dirPath,
      });
    } else if (lang === "cpp") {
      c = spawn(`${dirPath}/o.out`, options);
    } else if (lang === "py") {
      c = spawn(`python`, ["source.py"], { ...options, cwd: dirPath });
    } else if (lang === "js") {
      c = spawn(`node`, ["source.js"], { ...options, cwd: dirPath });
    } else {
      console.log("not supported lang");
      return reject();
    }

    // write input to stdin for cp
    c.stdin.write(input);
    c.stdin.end();

    c.on("error", (err) => {
      reject(err);
    });

    c.on("exit", (code, signal) => {
      result = {
        ...result,
        exitCode: code || 0,
        signal: signal,
        stdin: input,

        errorType:
          code === 0
            ? null
            : signal === "SIGTERM"
            ? "run-timeout"
            : signal === "SIGSEGV"
            ? "segmentation-error"
            : "run-time",

        runtime: +(performance.now() - start).toFixed(2),
        memoryUsage: +(process.memoryUsage().rss / (1024 * 1024)).toFixed(2),
      };
      // jvm exits with code 143 on infinite loop
      if (lang === "java" && code === 143)
        result = { ...result, errorType: "run-timeout", signal: "SIGTERM" };

      start = performance.now();
      resolve(result);
    });
    c.stderr.on("data", async (data) => {
      result.stderr += ("" + data).replace(new RegExp(dirPath, "g"), "...");
    });
    c.stdout.on("data", async (data) => {
      result.stdout += ("" + data).replace(new RegExp(dirPath, "g"), "...");
    });
  });
};
