import { Request, Response } from "express";
import imageKit from "../imagekit/config";
import fileUpload from "express-fileupload";
import prisma from "../lib/prisma";

export const getAllExercises = async (req: Request, res: Response) => {
  try {
    const exercises = await prisma.exercise.findMany({});
    res.status(200).json(exercises);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};

export const createExercise = async (req: Request, res: Response) => {
  console.log(req.body);
  console.log(req.files);
  if (!req.files || Object.keys(req.files).length === 0)
    return res.status(404).json({ message: "cover image not uploaded" });

  const coverImg = req.files.coverImg as fileUpload.UploadedFile;

  try {
    const result = await imageKit.upload({
      file: coverImg.data,
      fileName: "exercise cover image -" + req.body.title,
      folder: "/coding_ducks/exercises",
      extensions: [
        { name: "google-auto-tagging", maxTags: 5, minConfidence: 95 },
      ],
    });
    console.log(result);
    const newExercise = await prisma.exercise.create({
      data: {
        ...req.body,
        coverImg: result.url,
      },
    });
    res.status(200).json(newExercise);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "somethings wrong" });
  }
};
// export const getExamUsingId = async (req: Request, res: Response) => {
//   try {
//     const exam = await prisma.exam.findUnique({
//       where: {
//         id: +req.params.examId
//       }
//     })
//     res.status(200).json(exam)

//   } catch (err) {
//     console.log(err)
//     res.status(404).json({ message: 'somethings wrong' })
//   }
// }

// export const getExamUsingSlug = async (req: Request, res: Response) => {
//   try {
//     const exam = await prisma.exam.findUnique({
//       where: {
//         slug: req.params.slug
//       }
//     })
//     res.status(200).json(exam)

//   } catch (err) {
//     console.log(err)
//     res.status(404).json({ message: 'somethings wrong' })
//   }
// }

// export const updateExam = async (req: Request, res: Response) => {
//   if (req.files) {

//     const newCoverImg = req.files?.coverImg as fileUpload.UploadedFile

//     const result = await imageKit.upload({
//       file: newCoverImg.data,
//       fileName: "exam cover image -" + req.body.title,
//       folder: "/coding_ducks/exams",
//       extensions: [{ name: "google-auto-tagging", maxTags: 5, minConfidence: 95, },
//       ],
//     });
//     // if new image is uploaded add it to the req.body
//     if (result.url)
//       req.body.coverImg = result.url
//   }
//   try {
//     const updatedExam = await prisma.exam.update({
//       where: {
//         id: +req.params.examId
//       },
//       data: {
//         ...req.body
//       }
//     })
//     res.status(200).json(updatedExam)

//   } catch (err) {
//     console.log(err)
//     res.status(404).json({ message: 'somethings wrong' })
//   }
// }
// export const deleteExam = async (req: Request, res: Response) => {
//   try {
//     const deletedExam = await prisma.exam.delete({
//       where: {
//         id: +req.params.examId
//       },
//     })
//     res.status(200).json({ message: 'deleted' })

//   } catch (err) {
//     console.log(err)
//     res.status(404).json({ message: 'somethings wrong' })
//   }
// }
