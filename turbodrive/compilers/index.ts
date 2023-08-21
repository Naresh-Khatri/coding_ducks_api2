import { ExecException, exec } from "child_process";
import { ICompilationResult } from "..";

export const compileJava = async ({
  filePath,
  dirPath,
}: {
  filePath: string;
  dirPath: string;
}): Promise<ICompilationResult> => {
  const start = performance.now();
  return new Promise((resolve, reject) => {
    const p = exec(
      `javac ${filePath}`,
      (err: ExecException | null, stdout: string, stderr: string) => {
        return resolve({
          compileErr: err,
          compileStdout: stdout.replace(new RegExp(dirPath, "g"), "..."),
          compileStderr: stderr.replace(new RegExp(dirPath, "g"), "..."),
          compileSuccess: !!stderr,
          compileTime: +(performance.now() - start).toFixed(2),
        });
      }
    );
  });
};

export const compileCpp = async (
  dirPath: string
): Promise<ICompilationResult> => {
  const start = performance.now();
  return new Promise((resolve, reject) => {
    const p = exec(
      `g++ ${dirPath}/source.cpp -o ${dirPath}/o.out`,
      (err: ExecException | null, stdout: string, stderr: string) => {
        return resolve({
          compileErr: err,
          compileStdout: stdout.replace(new RegExp(dirPath, "g"), "..."),
          compileStderr: stderr.replace(new RegExp(dirPath, "g"), "..."),
          compileSuccess: !!stderr,
          compileTime: +(performance.now() - start).toFixed(2),
        });
      }
    );
  });
};
