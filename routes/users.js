import express from 'express';
import { loginHandler } from '../controllers/userController.js';

const router = express.Router();

router.post('/login', loginHandler);



export default router;
