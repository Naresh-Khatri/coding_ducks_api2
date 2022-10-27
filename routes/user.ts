import { Router } from "express";
import * as userController from "../controllers/user";

const router = Router();

router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.patch('/', userController.updateUser);
router.post('/checkUsername', userController.checkUsername);
router.post('/', userController.createUser);


export default router
