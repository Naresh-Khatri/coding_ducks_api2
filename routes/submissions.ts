import { Router } from 'express'
import { getSubmissions, getSubmissionById } from '../controllers/submissions'
import { checkIfAuthenticated } from '../middlewares/auth-middleware'

const router = Router()

//TODO: add auth
router.get('/', checkIfAuthenticated, getSubmissions)
router.get('/:submissionId', checkIfAuthenticated, getSubmissionById)

export default router
