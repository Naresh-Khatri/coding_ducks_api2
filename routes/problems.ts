import { Router } from 'express'
import * as problemsController from '../controllers/problems'
import { checkIfAuthenticated } from '../middlewares/auth-middleware'

const router = Router()

//TODO: add auth
router.get('/', [checkIfAuthenticated], problemsController.getAllProblems)
router.get('/examProblems/:examId', problemsController.getExamProblems)
router.get('/:problemId', [checkIfAuthenticated], problemsController.getProblem)
router.post('/', [checkIfAuthenticated], problemsController.createProblem)
router.get('/:problemId/getLastSubmission', [checkIfAuthenticated], problemsController.getLastSubmission)
router.patch('/:problemId', [checkIfAuthenticated], problemsController.updateProblem)
router.delete('/:problemId', [checkIfAuthenticated], problemsController.deleteProblem)

export default router

