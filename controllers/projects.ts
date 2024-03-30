import fs from "fs/promises";
import Path from "path";
import { Request, Response } from "express";
import prisma, { getRecursiveInclude } from "../lib/prisma";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";

type Framework = "vanilla" | "react" | "next" | "vue" | "nuxt" | "svelte";
export const createProject = async (req: Request, res: Response) => {
  try {
    const { framework, typescript, projectName } = req.body as {
      framework: Framework;
      typescript: boolean;
      projectName: string;
    };

    const template = await getTemplate(framework, typescript);
    // create room
    const room = await prisma.room.create({
      data: {
        name: projectName,
        owner: { connect: { id: req.user.userId } },
      },
    });

    // save template to db
    saveTemplateInDb({ root: { directory: template } }, 0, room.id);

    res
      .status(200)
      .json({ room, template, framework: req.params.framework }) as any;
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong", err }) as any;
  }
};
export const getUserProjects = async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        ownerId: req.user.userId,
      },
      select: {
        createdAt: true,
        updatedAt: true,
        id: true,
        isPublic: true,
        name: true,
        ownerId: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    res.status(200).json({ data: rooms }) as any;
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong", err }) as any;
  }
};
export const getProject = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const room = await prisma.room.findFirst({
      where: {
        id: +roomId,
      },
      select: {
        createdAt: true,
        updatedAt: true,
        id: true,
        isPublic: true,
        name: true,
        ownerId: true,
      },
    });
    const dirs = await prisma.directory.findMany({
      where: { roomId: +roomId, parentDir: null },
      include: getRecursiveInclude({
        depth: 6,
        obj: {
          files: {
            select: {
              id: true,
              fileName: true,
              parentDirId: true,
              lang: true,
              code: true,
              // isDeletable: true,
              // isArchived: true,
            },
          },
        },
      }),
    });

    res.status(200).json({ data: { room, dirs } }) as any;
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong", err }) as any;
  }
};

async function getTemplate(
  framework: Framework,
  typescript = false
): Promise<Record<string, any>> {
  const randDirName = crypto.randomUUID();
  return new Promise(async (resolve, reject) => {
    let child: ChildProcessWithoutNullStreams;
    if (framework === "next") {
      child = spawn(
        // syntax: yarn create-next-app my-next-app --typescript
        "yarn",
        ["create-next-app", randDirName, typescript ? "--ts" : ""],
        { cwd: "tmp/templates" }
      );
    } else if (framework === "nuxt") {
      child = spawn(
        // syntax: yarn create-nuxt-app my-next-app
        "yarn",
        ["create-nuxt-app", randDirName],
        { cwd: "tmp/templates" }
      );
    } else if (
      framework === "vanilla" ||
      framework === "react" ||
      framework === "vue" ||
      framework === "svelte"
    ) {
      child = spawn(
        // syntax: yarn create vite {projectName} --template {template}[-{ts}]
        "yarn",
        [
          "create",
          "vite",
          randDirName,
          "--template",
          framework + (typescript ? "-ts" : ""),
        ],
        { cwd: "tmp/templates" }
      );
    } else {
      return reject("invalid framework: " + framework);
    }
    // child.stdout.on("data", (data) => {
    //   console.log("" + data);
    // });

    child.stderr.on("data", (data) => {
      // console.error(`child stderr:\n${data}`);
      return reject("" + data);
    });
    child.on("exit", async (code) => {
      if (code === 0) {
        const template = await walkDirectory(
          Path.join(__dirname, "..", "tmp", "templates", randDirName)
        );
        // delete template dir
        spawn("rm", ["-rf", randDirName], { cwd: "tmp/templates" });
        return resolve(template);
      } else return reject(code);
    });
  });
}
async function walkDirectory(dir: string) {
  const files: Record<string, any> = {};

  const entries = await fs.readdir(dir, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const filePath = Path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files[entry.name] = {
          directory: await walkDirectory(filePath),
        };
      } else {
        files[entry.name] = {
          file: {
            contents: await fs.readFile(filePath, "utf8"),
          },
        };
      }
    })
  );

  return files;
}
async function saveTemplateInDb(
  entity: any,
  parentDirId: number,
  roomId: number
) {
  // console.log(Object.entries(entity).length)
  for (const key in entity) {
    if ("directory" in entity[key]) {
      console.log(key, " is a dir");
      const data = await prisma.directory.create({
        data: {
          owner: { connect: { id: 54 } },
          room: { connect: { id: roomId } },
          name: key,
          parentDir: parentDirId
            ? {
                connect: { id: parentDirId },
              }
            : undefined,
        },
      });
      saveTemplateInDb(entity[key].directory, data.id, roomId);
    } else {
      console.log(key, " is a file");
      const data = await prisma.file.create({
        data: {
          owner: { connect: { id: 54 } },
          room: { connect: { id: roomId } },
          fileName: key,
          code: entity[key].file.contents,
          lang: "js",
          parentDir: {
            connect: { id: parentDirId !== 0 ? parentDirId : undefined },
          },
        },
      });
    }
  }
}
