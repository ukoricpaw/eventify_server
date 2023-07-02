import { Router } from 'express';
import imageController from '../controllers/imageController.js';
const imageRouter = Router();

imageRouter.get('/:uuid', imageController.getImage);

export default imageRouter;
