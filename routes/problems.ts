import { Router } from 'express'
import * as problemsController from '../controllers/problems'

const router = Router()

//TODO: add auth
router.get('/', problemsController.getAllProblems)

export default router
