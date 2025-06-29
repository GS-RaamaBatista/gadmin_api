import express from 'express';
import { loginHandler } from '../controllers/userController.js';

const router = express.Router();

router.get('/', loginHandler);


export default router;
