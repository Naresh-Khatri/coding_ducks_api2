import { UUID } from "crypto";
import { PythonShell } from "python-shell";

export const getContours = async (uuid: UUID): Promise<{ files: string[] }> => {
  return new Promise((resolve, reject) => {
    const pyShell = new PythonShell("python/generate_contours.py", {
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
    });
    pyShell.on("close", () => {
      console.log("closeddd");
      const files = [
        "output.png",
        "target.png",
        "output_contours.png",
        "target_contours.png",
        "diff.png",
        "filled_output.png",
        "mask.png",
        "og.png",
      ];
      resolve({ files });
    });
  });
};

export const getScore = async (uuid: UUID): Promise<{ score: string }> => {
  return new Promise((resolve, reject) => {
    let score = "";
    const pyShell = new PythonShell("python/generate_score.py", {
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
      if (message.includes("score:"))
        score = parseFloat(message.split(" ")[1]).toString();
    });
    pyShell.on("close", () => {
      console.log("closeddd");
      resolve({ score });
    });
  });
};
