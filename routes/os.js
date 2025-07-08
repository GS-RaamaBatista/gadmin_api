import express from 'express';
import { getOS, getSetores } from '../controllers/osController.js';

const router = express.Router();

router.get('/', getOS);
router.get('/setores', getSetores);

export default router;
