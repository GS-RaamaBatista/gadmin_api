import express from 'express';
import { logoutHandler } from '../controllers/logoutController.js'

const router = express.Router();

router.post('/', logoutHandler);

export default router;
