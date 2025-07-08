import express from 'express';
import { selectOs } from '../controllers/selectOsController.js';

const router = express.Router();

router.get('/', selectOs);

export default router;
