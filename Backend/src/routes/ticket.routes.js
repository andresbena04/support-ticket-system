import { Router } from 'express';
import { createNewTicket, fetchTicketById, fetchTicketByUserId, fetchTickets, modifyTicket, removeTicket } from '../controllers/ticket.controller.js';
import { authenticateUserToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('', authenticateUserToken, createNewTicket);
router.get('', authenticateUserToken, fetchTickets);
router.get('/:id', authenticateUserToken, fetchTicketById);
router.get('/user/:id', authenticateUserToken, fetchTicketByUserId);
router.put('/:id', authenticateUserToken, modifyTicket);
router.delete('/:id', authenticateUserToken, removeTicket);

export default router;