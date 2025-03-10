import express from 'express';
import routerAuth from './auth/auth.routes.js';
import routerTickets from './ticket.routes.js';
import routerHistory from './history.routes.js';
import routerComment from './comment.routes.js';
import routerUsers from './users.routes.js';

const router = express.Router();

//router.use('/users', ApiKeyMiddleware, routesUsers);
router.use('/auth', routerAuth)
router.use('/tickets', routerTickets)
router.use('/history', routerHistory)
router.use('/comments', routerComment)
router.use('/users', routerUsers)


export default router;