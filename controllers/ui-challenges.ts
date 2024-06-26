import https from "node:https";
import { Request, Response } from "express";
import imageKit from "../imagekit/config";
import prisma from "../lib/prisma";
import nodeHtmlToImage from "node-html-to-image";
import { generateHtmlString, generateOGHtmlString } from "../lib/utils";
import { randomUUID } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import { getContours, getScore } from "../python";
import axios from "axios";

// -----------------ADMIN STUFF_----------------
export const getAllChallenges = async (req: Request, res: Response) => {
  try {
    let challenges;
    if (req.user?.isAdmin) challenges = await prisma.challenge.findMany();
    else
      challenges = await prisma.challenge.findMany({
        where: { isPublic: true },
      });
    res.status(200).json({ status: "success", data: challenges });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};

export const getChallenge = async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;

    const where: { id?: number; slug?: string } = {};
    if (/^\d+$/.test(idOrSlug)) {
      // check if idOrSlug is a number -> id
      where.id = +idOrSlug;
    } else {
      // otherwise its a slug
      where.slug = idOrSlug;
    }
    const challenge = await prisma.challenge.findFirst({
      where: where,
      include: {
        ChallengeAttempt: {
          select: {
            id: true,
            lastSubmitted: true,
            score: true,
            updatedAt: true,
            status: true,
            user: {
              select: {
                username: true,
                photoURL: true,
                fullname: true,
              },
            },
          },
          orderBy: { lastSubmitted: "desc" },
        },
      },
    });
    res.status(200).json({ status: "success", data: challenge });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};

export const getAttempts = async (req: Request, res: Response) => {
  try {
    const { challengeId } = req.params;
    const challengeAttempts = await prisma.challengeAttempt.findMany({
      where: { challengeId: +challengeId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            photoURL: true,
            fullname: true,
          },
        },
      },
      orderBy: { score: "desc" },
    });
    res.status(200).json({ status: "success", data: challengeAttempts });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};

export const createChallenge = async (req: Request, res: Response) => {
  // console.log(req.user)
  // return res.status(200).json({ message: "success" });
  const {
    head,
    html,
    css,
    js,
    slug,
    title,
    difficulty,
    description,
    isPublic,
    ogImageScale,
  } = req.body;
  const mobileHtmlTemplate = generateHtmlString({
    html,
    css,
    js,
    isMobile: true,
  });
  const desktopHtmlTemplate = generateHtmlString({
    html,
    css,
    js,
    isMobile: false,
  });
  const ogImageTemplate = generateOGHtmlString(
    {
      html,
      css,
      js,
    },
    +ogImageScale === 0 ? 1 : +ogImageScale
  );

  try {
    await imageKit.createFolder({
      parentFolderPath: "/coding_ducks/ui-challenges",
      folderName: String(slug),
    });

    const [mobileImage, desktopImage, ogImage] = await Promise.all([
      nodeHtmlToImage({
        html: mobileHtmlTemplate,
        puppeteerArgs: { args: ["--no-sandbox"] },
      }) as Promise<Buffer>,
      nodeHtmlToImage({
        html: desktopHtmlTemplate,
        puppeteerArgs: { args: ["--no-sandbox"] },
      }) as Promise<Buffer>,
      nodeHtmlToImage({
        html: ogImageTemplate,
        puppeteerArgs: { args: ["--no-sandbox"] },
      }) as Promise<Buffer>,
    ]);
    const [mobileImageuploaded, desktopImageUploaded, ogImageUploaded] =
      await Promise.all([
        imageKit.upload({
          file: mobileImage,
          fileName: "mobile.png",
          folder: "/coding_ducks/ui-challenges/" + slug,
        }),
        imageKit.upload({
          file: desktopImage,
          fileName: "desktop.png",
          folder: "/coding_ducks/ui-challenges/" + slug,
        }),
        imageKit.upload({
          file: ogImage,
          fileName: "og-image.png",
          folder: "/coding_ducks/ui-challenges/" + slug,
        }),
      ]);
    // console.log(mobileImageuploaded, desktopImageUploaded);
    const newChallenge = await prisma.challenge.create({
      data: {
        title,
        slug,
        description,
        difficulty,
        isPublic,
        contentHEAD: head,
        contentHTML: html,
        contentCSS: css,
        contentJS: js,
        desktopPreview: desktopImageUploaded.url,
        mobilePreview: mobileImageuploaded.url,
        ogImage: ogImageUploaded.url,
        creator: { connect: { id: req.user?.userId } },
      },
    });
    res.status(200).json({ status: "success", data: newChallenge });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};

export const updateChallenge = async (req: Request, res: Response) => {
  const {
    head,
    html,
    css,
    js,
    slug,
    title,
    difficulty,
    description,
    isPublic,
    ogImageScale,
  } = req.body;
  const mobileHtmlTemplate = generateHtmlString({
    html,
    css,
    js,
    isMobile: true,
  });
  const desktopHtmlTemplate = generateHtmlString({
    html,
    css,
    js,
    isMobile: false,
  });
  const ogImageTemplate = generateOGHtmlString(
    {
      html,
      css,
      js,
    },
    +ogImageScale === 0 ? 1 : +ogImageScale
  );

  try {
    const updatedData: any = {
      title,
      slug,
      description,
      difficulty,
      isPublic,
      ogImageScale: +ogImageScale === 0 ? 1 : +ogImageScale,
    };
    const dbChallenge = await prisma.challenge.findFirst({
      where: { id: +req.params.challengeId },
      select: {
        contentHEAD: true,
        contentCSS: true,
        contentHTML: true,
        contentJS: true,
        ogImageScale: true,
      },
    });
    if (!dbChallenge)
      return res.status(404).json({ message: "challenge not found" });
    const { contentHEAD, contentHTML, contentCSS, contentJS } = dbChallenge;
    if (
      contentHEAD !== head ||
      contentHTML !== html ||
      contentCSS !== css ||
      contentJS !== js ||
      dbChallenge.ogImageScale !== +ogImageScale
    ) {
      //  await imageKit.deleteFolder(`/coding_ducks/ui-challenges/${slug}`);
      await imageKit.createFolder({
        parentFolderPath: "/coding_ducks/ui-challenges",
        folderName: String(slug),
      });

      const [mobileImage, desktopImage, ogImage] = await Promise.all([
        nodeHtmlToImage({
          html: mobileHtmlTemplate,
          puppeteerArgs: { args: ["--no-sandbox"] },
        }) as Promise<Buffer>,
        nodeHtmlToImage({
          html: desktopHtmlTemplate,
          puppeteerArgs: { args: ["--no-sandbox"] },
        }) as Promise<Buffer>,
        nodeHtmlToImage({
          html: ogImageTemplate,
          puppeteerArgs: { args: ["--no-sandbox"] },
        }) as Promise<Buffer>,
      ]);
      const [mobileImageuploaded, desktopImageUploaded, ogImageUploaded] =
        await Promise.all([
          imageKit.upload({
            file: mobileImage,
            fileName: "mobile.png",
            folder: "/coding_ducks/ui-challenges/" + slug,
          }),
          imageKit.upload({
            file: desktopImage,
            fileName: "desktop.png",
            folder: "/coding_ducks/ui-challenges/" + slug,
          }),
          imageKit.upload({
            file: ogImage,
            fileName: "og-image.png",
            folder: "/coding_ducks/ui-challenges/" + slug,
          }),
        ]);
      console.log(ogImageUploaded);
      updatedData["contentHEAD"] = head;
      updatedData["contentHTML"] = html;
      updatedData["contentCSS"] = css;
      updatedData["contentJS"] = js;
      updatedData["ogImageScale"] = ogImageScale;
      updatedData["desktopPreview"] = desktopImageUploaded.url;
      updatedData["mobilePreview"] = mobileImageuploaded.url;
      updatedData["ogImage"] = ogImageUploaded.url;
    }
    const updatedChallenge = await prisma.challenge.update({
      where: { id: +req.params.challengeId },
      data: updatedData,
    });
    res.status(200).json({ status: "success", data: updatedChallenge });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};

export const recalculateChallengeAttempts = async (
  req: Request,
  res: Response
) => {
  try {
    const { challengeId, attemptId } = req.body;
    console.log(challengeId, attemptId);
    const challenge = await prisma.challenge.findUnique({
      where: { id: +challengeId },
      select: {
        id: true,
        ChallengeAttempt: !attemptId ?? {
          select: {
            id: true,
            imgCode: true,
          },
        },
        contentHEAD: true,
        contentHTML: true,
        contentCSS: true,
        contentJS: true,
        ogImageScale: true,
        desktopPreview: true,
      },
    });
    if (!challenge)
      return res.status(404).json({ message: "challenge not found" });
    console.log("started recalculating for challenge " + challenge.id);

    const targetImage = await axios.get(challenge.desktopPreview, {
      responseType: "arraybuffer",
    });

    let attempts;
    if (attemptId) {
      const attempt = await prisma.challengeAttempt.findUnique({
        where: { id: +attemptId },
        select: {
          id: true,
          imgCode: true,
        },
      });
      attempts = [attempt];
    } else {
      attempts = challenge.ChallengeAttempt;
    }
    const result = [];
    for (let i = 0; i < attempts.length; i++) {
      if (!attempts[i] || !attempts[i]?.imgCode) continue;
      const uuid = randomUUID();
      const _path = path.join(__dirname, "..", "python", "tmp", uuid);
      await mkdir(_path, {
        recursive: true,
      });
      // @ts-ignore
      const codeImage = await axios.get(attempts[i].imgCode, {
        responseType: "arraybuffer",
      });
      await Promise.all([
        writeFile(path.join(_path, "target.png"), targetImage.data),
        writeFile(path.join(_path, "output.png"), codeImage.data),
      ]);

      const { score } = await getScore(uuid);
      console.log("score", attempts[i]?.id, attempts[i]?.imgCode, score);
      result.push(
        await prisma.challengeAttempt.update({
          where: { id: attempts[i]?.id },
          data: {
            score: parseInt((+score * 1000).toString()),
          },
        })
      );
    }
    res.status(200).json({ message: "done", data: result });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
export const deleteChallenge = async (req: Request, res: Response) => {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: +req.params.challengeId },
    });
    // delete image from imagekit
    // await imageKit.deleteFolder(
    //   "/coding_ducks/ui-challenges/" + challenge?.slug
    // );
    const deletedChallenge = await prisma.challenge.delete({
      where: {
        id: +req.params.challengeId,
      },
    });
    res.status(200).json({ message: "deleted" });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};

// -----------------ATTEMPTS STUFF_----------------
export const getAttempt = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;
    const attempt = await prisma.challengeAttempt.findFirst({
      where: {
        id: +attemptId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullname: true,
            photoURL: true,
          },
        },
        challenge: {
          select: {
            title: true,
            contentHEAD: true,
            contentHTML: true,
            contentCSS: true,
            contentJS: true,
          },
        },
      },
    });
    if (!attempt)
      return res
        .status(404)
        .json({ status: "failed", data: { msg: "Attempt not found" } });

    res.status(200).json({ status: "success", data: attempt });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
export const getHighScores = async (req: Request, res: Response) => {
  try {
    const { challengeId } = req.params;
    const { userId } = req.query;

    if (userId) {
      const userAttempt = await prisma.challengeAttempt.findFirst({
        where: {
          challengeId: +challengeId,
          userId: +userId,
        },
        orderBy: { createdAt: "desc" },
      });
      res.status(200).json({
        status: "success",
        data: userAttempt,
      });
    } else {
      const attemptsGroup = await prisma.challengeAttempt.groupBy({
        by: ["userId", "challengeId", "status", "score"],
        having: { challengeId: +req.params.challengeId, status: "submitted" },
        orderBy: { score: "desc" },
      });
      /**
       * cant use include in a groupby query in prisma
       * https://github.com/prisma/prisma/discussions/10890
       */
      const usersAttempts = await prisma.challengeAttempt.findMany({
        where: {
          userId: { in: attemptsGroup.map((a) => a.userId) },
          challengeId: +req.params.challengeId,
          status: "submitted",
        },
        select: {
          imgCode: true,
          score: true,
          id: true,
          createdAt: true,
          status: true,
          user: {
            select: {
              id: true,
              username: true,
              photoURL: true,
              fullname: true,
            },
          },
        },
        orderBy: { score: "desc" },
      });
      // fuck TS, it works
      const dedupedAttempts = usersAttempts.reduce((acc: any, curr: any) => {
        const exists = acc.find((a: any) => a.user.id === curr.user.id);
        if (!exists) acc.push(curr);
        else {
          if (curr.score > exists.score) exists.score = curr.score;
        }
        return acc;
      }, []);
      res.status(200).json({
        status: "success",
        data: dedupedAttempts,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
export const submitAttempt = async (req: Request, res: Response) => {
  try {
    // set headers for streaming
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Transfer-Encoding", "chunked");

    const { challengeId } = req.params;
    const { head, html, css, js } = req.body.contents;
    res.write(
      JSON.stringify({ stage: "1", status: "Searching for challenge" }) + "↩"
    );
    const challenge = await prisma.challenge.findFirst({
      where: { id: +challengeId },
      select: {
        slug: true,
        contentHEAD: true,
        contentHTML: true,
        contentCSS: true,
        contentJS: true,
        ogImageScale: true,
      },
    });
    if (!challenge) {
      return res.status(404).json({ message: "challenge not found" });
    }
    res.write(JSON.stringify({ status: "Generating Templates" }) + "↩");
    const outputTemplate = generateHtmlString({
      html,
      css,
      js,
      isMobile: false,
    });
    const targetTemplate = generateHtmlString({
      html: challenge?.contentHTML,
      css: challenge?.contentCSS,
      js: challenge?.contentJS,
      isMobile: false,
    });
    const ogImageTemplate = generateOGHtmlString(
      {
        html: html,
        css: css,
        js: js,
      },
      challenge.ogImageScale === 0 ? 1 : +challenge.ogImageScale
    );
    console.log(ogImageTemplate);

    res.write(JSON.stringify({ status: "Generating screenshots" }) + "↩");
    // take both images and compare
    const [codeImageBuffer, targetImageBuffer, ogImageBuffer] =
      await Promise.all([
        nodeHtmlToImage({
          html: outputTemplate,
          puppeteerArgs: { args: ["--no-sandbox"] },
        }) as Promise<Buffer>,
        nodeHtmlToImage({
          html: targetTemplate,
          puppeteerArgs: { args: ["--no-sandbox"] },
        }) as Promise<Buffer>,
        nodeHtmlToImage({
          html: ogImageTemplate,
          puppeteerArgs: { args: ["--no-sandbox"] },
        }) as Promise<Buffer>,
      ]);

    // create attempt directory for user
    await imageKit.createFolder({
      parentFolderPath: "/coding_ducks/ui-challenges/",
      folderName: "attempts",
    });
    await imageKit.createFolder({
      parentFolderPath: "/coding_ducks/ui-challenges/attempts",
      folderName: String(req.user.userId),
    });

    res.write(JSON.stringify({ status: "Storing images" }) + "↩");
    // store images locally then call python script
    const uuid = randomUUID();
    const _path = path.join(__dirname, "..", "python", "tmp", uuid);
    console.log(uuid, _path);
    await mkdir(_path, {
      recursive: true,
    });
    await Promise.all([
      writeFile(path.join(_path, "target.png"), targetImageBuffer),
      writeFile(path.join(_path, "output.png"), codeImageBuffer),
      writeFile(path.join(_path, "og.png"), ogImageBuffer),
    ]);

    console.log(_path);
    res.write(JSON.stringify({ status: "generating contours" }) + "↩");
    const { files } = await getContours(uuid);
    res.write(JSON.stringify({ status: "uploading to imgkit" }) + "↩");
    const imgkitDirname = `/coding_ducks/ui-challenges/${challenge.slug}/attempts/${req.user?.userId}`;
    const result = await Promise.all(
      files.map(async (fileName) => {
        console.log(fileName);
        return imageKit.upload({
          file: await readFile(path.join(_path, fileName)),
          fileName: fileName,
          folder: imgkitDirname,
        });
      })
    );
    res.write(JSON.stringify({ status: "storing in db" }) + "↩");
    const newAttempt = await prisma.challengeAttempt.create({
      data: {
        challenge: { connect: { id: +challengeId } },
        user: { connect: { id: req.user.userId } },
        status: "submitted",
        lastSubmitted: new Date().toISOString(),
        contentHEAD: head,
        contentHTML: html,
        contentCSS: css,
        contentJS: js,

        imgCode: result[0].url,
        imgTarget: result[1].url,
        imgAfter: result[2].url,
        imgBefore: result[3].url,
        imgDiff: result[4].url,
        imgFilledAfter: result[5].url,
        imgMask: result[6].url,
        ogImage: result[7].url,
        score: 0,
      },
      include: {
        challenge: { select: { id: true, slug: true, title: true } },
      },
    });
    res.write(
      JSON.stringify({
        stage: "2",
        status: "generate score",
        data: newAttempt,
      }) + "↩"
    );
    const { score } = await getScore(uuid);
    await prisma.challengeAttempt.update({
      where: { id: +newAttempt.id },
      data: {
        score: parseInt((+score * 1000).toString()),
      },
    });
    //TODO: also upload an HD image later
    res.write(
      JSON.stringify({
        status: "done",
        score: Math.round(+score * 100),
      }) + "↩"
    );
    res.end();
    await rm(_path, { recursive: true });
  } catch (err) {
    console.log("lol");
    console.log(err);
    res.write(JSON.stringify({ error: "something went wrong" }) + "↩");
    res.end();
  }
};

export const updateAttempt = async (req: Request, res: Response) => {
  const { attemptId } = req.params;
  const { head, html, css, js } = req.body;
  try {
    // TODO: add AI stuff to calculate score
    const updatedAttempt = await prisma.challengeAttempt.update({
      where: {
        id: +attemptId,
      },
      data: {
        contentHEAD: head,
        contentHTML: html,
        contentCSS: css,
        contentJS: js,
      },
    });
    res.status(200).json({ status: "success", data: updatedAttempt });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
export const createDummyAttempt = async (req: Request, res: Response) => {
  try {
    const { challengeId } = req.params;
    const existingAttempt = await prisma.challengeAttempt.findFirst({
      where: {
        userId: req.user?.userId,
        challengeId: +challengeId,
      },
      orderBy: { createdAt: "desc" },
    });
    if (existingAttempt)
      return res.status(200).json({ status: "success", data: existingAttempt });

    const newAttempt = await prisma.challengeAttempt.create({
      data: {
        challenge: { connect: { id: +req.params.challengeId } },
        user: { connect: { id: req.user?.userId } },
      },
    });
    res.status(200).json({ status: "success", data: newAttempt });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};

// ----------------- SCREENSHOT STUFF ----------------
export const captureScreenshot = async (req: Request, res: Response) => {
  try {
    const { head, html, css, js } = req.body;

    const htmlTemplate = generateOGHtmlString({
      html,
      css,
      js,
    });
    console.log(htmlTemplate);
    const image = (await nodeHtmlToImage({
      html: htmlTemplate.replaceAll("\n", ""),
      puppeteerArgs: { args: ["--no-sandbox"] },
    })) as Buffer;
    const upload = await imageKit.upload({
      file: Buffer.from(image),
      fileName: "screenshot.png",
      folder: `/coding_ducks/ui-challenges/test`,
    });
    console.log(upload);
    res.status(200).json({ data: upload });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
