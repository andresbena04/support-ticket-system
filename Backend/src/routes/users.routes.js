import { Router } from "express";
import { fetchUserById, fetchUsers, modifyUser, removeUser } from "../controllers/users.controller.js";
import { authenticateSuperToken, authenticateUserToken } from "../middlewares/auth.middleware.js";
import { authorizeRole } from "../middlewares/authorizeRole.middleware.js";

const router = Router();

router.get('', authenticateUserToken, authorizeRole(['ADMIN']), fetchUsers);
router.get('/:id', authenticateUserToken, authorizeRole(['ADMIN']), fetchUserById);
router.get('/profile/:id', authenticateUserToken, fetchUserById);
router.put('/:id', authenticateSuperToken, authorizeRole(['ADMIN']), modifyUser);
router.delete('/:id', authenticateSuperToken, authorizeRole(['ADMIN']), removeUser);

export default router;