import { authenticateUser, verifyAccessToken, refreshAccessToken, registerUser, requestPasswordReset, resetPassword, importUsersFromExcel, changePassword } from "../../services/auth.service.js";
import { sendEmail } from "../../services/email.service.js";
import crypto from 'crypto';

export const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { accessToken, refreshToken, user } = await authenticateUser(email, password);
        res.json({ accessToken, refreshToken, user });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

export const handleRegister = async (req, res) => {
    const { email, role } = req.body;
    try {
        const randomPassword = generateRandomPassword();
        await registerUser(email, randomPassword, role);

        // Enviar correo con las credenciales
        const subject = 'Detalles de tu registro';
        const text = `Hola,\n\nTu cuenta ha sido creada con éxito.\n\nAquí están tus credenciales:\n\nCorreo electrónico: ${email}\nContraseña: ${randomPassword}\n\nPor favor, cambia tu contraseña después de iniciar sesión.\n\nSaludos cordiales,\nTu equipo`;

        await sendEmail(email, subject, text); // Enviar el correo

        // Responder con los tokens y datos del usuario
        res.status(200).json({ message: 'Usuario registrado exitosamente' });

    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};
// Función para importar usuarios desde un archivo Excel
export const handleImportUsers = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo.' });
        }

        const result = await importUsersFromExcel(req.file.buffer);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: `Error al importar usuarios: ${error.message}` });
    }
};
export const generateRandomPassword = (length = 10) => {
    // Puedes modificar la longitud de la contraseña como desees
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>?';
    let password = '';
    
    // Generar la cantidad de bytes necesarios
    const bytes = crypto.randomBytes(length);

    // Para cada byte generado, mapearlo a un carácter de la cadena `characters`
    for (let i = 0; i < length; i++) {
        password += characters.charAt(bytes[i] % characters.length); // `% characters.length` asegura que el índice esté dentro del rango
    }

    return password;
}
export const handlePasswordResetRequest = async (req, res) => {
    const { email } = req.body;
    try {
        const response = await requestPasswordReset(email.email);
        res.json(response);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const handlePasswordReset = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const response = await resetPassword(token, newPassword);
        res.json(response);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const handleChangePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.userId; // Obtenido del middleware de autenticación

        const response = await changePassword(userId, oldPassword, newPassword);
        res.json(response);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
export const handleTokenVerification = async (req, res) => {
    const { token } = req.headers;
    try {
        const decodedToken = verifyAccessToken(token);
        res.json({ message: 'Access token válido', decodedToken });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

export const handleTokenRefresh = async (req, res) => {
    const { refreshToken } = req.body;
    try {
        const newAccessToken = refreshAccessToken(refreshToken);
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};
