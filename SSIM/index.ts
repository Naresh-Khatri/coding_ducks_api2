import { UUID } from "crypto";
import { PythonShell } from "python-shell";

export const runSSIM = async (
  uuid: UUID
): Promise<{ score: string; files: string[] }> => {
  return new Promise((resolve, reject) => {
    let score = "";
    const pyShell = new PythonShell("SSIM/SSIM.py", {
      args: [uuid],
    });
    pyShell.on("error", function (message) {
      console.log("error", message);
      reject(message);
    });
    pyShell.on("pythonError", function (message) {
      console.log("perror", message);
      reject(message);
    });
    pyShell.on("stderr", function (message) {
      console.log("strerr", message);
      reject(message);
    });
    pyShell.on("message", function (message: string) {
      console.log("msg", message);
      if (message.includes("SSIM"))
        score = parseFloat(message.split(" ")[1]).toString();
    });
    pyShell.on("close", () => {
      const files = [
        "code.png",
        "target.png",
        "before.png",
        "after.png",
        "diff.png",
        "filled_after.png",
        "mask.png",
        "og.png",
      ];
      resolve({ score, files });
    });
  });
};
