import { Router } from 'express';
import userController from '../controllers/userController.js';
import { body } from 'express-validator';
const userRouter = Router();

userRouter.post(
  '/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 8, max: 20 }),
  userController.registration,
);
userRouter.post('/login', userController.login);
userRouter.get('/logout', userController.logout);
userRouter.get('/refresh', userController.refresh);
userRouter.get('/activate/:link', userController.activate);

export default userRouter;
