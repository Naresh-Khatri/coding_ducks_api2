import { Router } from "express";
import * as userController from "../controllers/user";

const router = Router();

router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.post('/checkUsername', userController.checkUsername);
router.post('/', userController.createUser);


export default router
