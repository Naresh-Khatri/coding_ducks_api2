import { Router } from 'express'
import * as problemsController from '../controllers/problems'
import { checkIfAdmin, checkIfAuthenticated } from '../middlewares/auth-middleware'

const router = Router()

//TODO: add auth
router.get('/', [checkIfAuthenticated, checkIfAdmin], problemsController.getAllProblems)
router.post('/', [checkIfAuthenticated], problemsController.createProblem)

router.get('/tags', problemsController.getProblemTags)

router.get('/page', [checkIfAuthenticated], problemsController.getProblemsForProblemPage)
router.get('/slug/:slug', problemsController.getProblemBySlug)
router.get('/:problemId', [checkIfAuthenticated], problemsController.getProblem)
router.get('/examProblems/:examId',[checkIfAuthenticated], problemsController.getExamProblems)

router.get('/:problemId/ratings/', [], problemsController.getProblemRating)
router.patch('/:problemId/ratings/', [checkIfAuthenticated], problemsController.updateProblemRating)

router.get('/:problemId/getLastSubmission', [checkIfAuthenticated], problemsController.getLastSubmission)

router.patch('/:problemId', [checkIfAuthenticated], problemsController.updateProblem)
router.delete('/:problemId', [checkIfAuthenticated], problemsController.deleteProblem)


export default router

