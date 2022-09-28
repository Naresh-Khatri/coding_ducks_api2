import { Router } from 'express'
import * as examsController from '../controllers/exams'

const router = Router()

//TODO: add auth
router.get('/', examsController.getAllExams)
router.get('/:examId', examsController.getExam)
router.post('/', examsController.createExam)
router.patch('/:examId', examsController.updateExam)
router.delete('/:examId', examsController.deleteExam)

export default router

