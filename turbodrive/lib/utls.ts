import { randomUUID } from "crypto";
import { existsSync, mkdirSync, writeFile } from "fs";
import * as path from "path";
import { Lang } from "../../types";

const getRandDirName = () =>
  path.join(__dirname, "../", ".tmp", `_source-${Date.now()}-${randomUUID()}`);

const checkExistsAndMakeDir = (path: string) => {
  if (!existsSync(path)) {
    mkdirSync(path);
  }
};

const writeSourceFile = async (
  source: string,
  lang: Lang
): Promise<{ dirPath: string; filePath: string }> => {
  return new Promise((resolve, reject) => {
    try {
      const dirPath = getRandDirName();
      checkExistsAndMakeDir(dirPath);
      let filePath = path.join(dirPath, `source.${lang}`);
      // only in case of java we need to extract class name to exec
      if (lang === "java")
        filePath = path.join(dirPath, `${extractClassName(source)}.java`);
        
      writeFile(filePath, source, (err) => {
        if (err) reject(err);
        resolve({ dirPath, filePath });
      });
    } catch (err) {
      console.log("eeee:", err);
      reject(err);
    }
  });
};

const extractClassName = (javaCode: string) => {
  // Regular expression to match class declarations
  const classDeclarationRegex = /class\s+(\w+)/;

  // Search for a class declaration and extract the class name
  const match = javaCode.match(classDeclarationRegex);

  // Check if a match was found
  if (match && match.length > 1) {
    return match[1]; // The class name is captured in the first capturing group
  } else {
    return null; // Class name not found in the code
  }
};

export {
  getRandDirName,
  checkExistsAndMakeDir,
  writeSourceFile,
  extractClassName,
  // compileGcc,
  // executeCpp,
};
