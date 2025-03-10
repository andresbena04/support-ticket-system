import { Router } from 'express';
import { authenticateUserToken } from '../middlewares/auth.middleware.js';
import { fetchCommentsByTicket, newComment, removeComment, updateCommentHandler } from '../controllers/comment.controller.js';

const router = Router();

router.post('/', authenticateUserToken, newComment);
router.get('/:id', authenticateUserToken, fetchCommentsByTicket);
router.put('/:id', authenticateUserToken, updateCommentHandler);
router.delete('/:id',authenticateUserToken, removeComment);


export default router;