import { Router } from 'express';
import { authenticateUserToken } from '../middlewares/auth.middleware.js';
import { fetchHistoryByTicket, newHistoryEntry } from '../controllers/history.controller.js';

const router = Router();

router.post('', authenticateUserToken, newHistoryEntry);
router.get('/:id', authenticateUserToken, fetchHistoryByTicket);


export default router;