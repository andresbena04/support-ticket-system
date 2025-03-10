import { Router } from 'express';
import multer from 'multer';
import { handleChangePassword, handleImportUsers, handleLogin, handlePasswordReset, handlePasswordResetRequest, handleRegister, handleTokenRefresh, handleTokenVerification } from '../../controllers/auth/auth.controller.js';
import { authenticateSuperToken, authenticateUserToken } from '../../middlewares/auth.middleware.js';

const router = Router();
const upload = multer(); // Multer para manejar archivos en memoria

// Rutas de autenticación
router.post('/signin', handleLogin);
router.post('/signup', authenticateSuperToken, handleRegister);
router.post('/token/refresh', handleTokenRefresh);
router.get('/token/validate', handleTokenVerification);
router.post('/password-reset/request', handlePasswordResetRequest);
router.post('/password-reset/confirm', handlePasswordReset);
router.put('/change-password', authenticateUserToken, handleChangePassword);

// Ruta para importar usuarios desde un archivo Excel
router.post('/import-users', authenticateSuperToken, upload.single('file'), handleImportUsers);

export default router;
