import { Router } from "express";
import * as userController from "../controllers/user";
import { checkIfAuthenticated } from "../middlewares/auth-middleware";

const router = Router();

router.get('/', userController.getUsers);
router.get('/:gid', userController.getUser);
router.get('/progress/:userId', userController.getUserProgress);
router.get('/username/:username', userController.getUserUsingUsername);
router.patch('/', [checkIfAuthenticated], userController.updateUser);
router.post('/checkUsername', userController.checkUsername);
router.post('/', userController.createUser);
router.post('/follow', [checkIfAuthenticated], userController.followUser);
// router.get('/getFollowDetails/:username', [checkIfAuthenticated], userController.getFollowDetails);
router.post('/unfollow', [checkIfAuthenticated], userController.unfollowUser);


export default router
