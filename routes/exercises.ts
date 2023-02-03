import { Router } from 'express'
import fileUpload from "express-fileupload";
import * as exercisesController from '../controllers/exercises'

import { checkIfAuthenticated } from '../middlewares/auth-middleware';

const router = Router()
router.use(fileUpload());

//TODO: add auth
router.get('/', exercisesController.getAllExercises)
// router.get('/slug/:slug', exercisesController.getExamUsingSlug)
// router.get('/id/:examId', exercisesController.getExamUsingId)
router.post('/', [checkIfAuthenticated], exercisesController.createExercise)
// router.patch('/:examId', [checkIfAuthenticated], exercisesController.updateExam)
// router.delete('/:examId', [checkIfAuthenticated], exercisesController.deleteExam)

export default router

