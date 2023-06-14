import { Router } from 'express'
import * as problemsController from '../controllers/problems'
import { checkIfAuthenticated } from '../middlewares/auth-middleware'

const router = Router()

//TODO: add auth
router.get('/', [checkIfAuthenticated], problemsController.getAllProblems)
router.get('/page', problemsController.getProblemsForProblemPage)
router.get('/tags', problemsController.getProblemTags)
router.get('/examProblems/:examId',[checkIfAuthenticated], problemsController.getExamProblems)
router.get('/:problemId', [checkIfAuthenticated], problemsController.getProblem)
router.post('/', [checkIfAuthenticated], problemsController.createProblem)
router.get('/:problemId/getLastSubmission', [checkIfAuthenticated], problemsController.getLastSubmission)
router.patch('/:problemId', [checkIfAuthenticated], problemsController.updateProblem)
router.delete('/:problemId', [checkIfAuthenticated], problemsController.deleteProblem)

export default router

