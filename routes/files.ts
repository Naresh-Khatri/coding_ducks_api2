import { Router } from 'express'
import * as filesController from '../controllers/files'

const router = Router()

//TODO: add auth
router.get('/all', filesController.getAllFiles)
router.get('/:userID', filesController.getUserFiles)
router.post('/', filesController.createUserFile)
router.put('/:id', filesController.updateUserFile)
router.delete('/:id', filesController.deleteUserFile)

export default router