import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { generateRandomPassword } from '../controllers/auth/auth.controller.js';
import * as xlsx from 'xlsx';
import { prisma } from '../config/db.js';
import { sendEmail } from './email.service.js';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET
const JWT_SUPERUSER_SECRET = process.env.SUPERUSER_TOKEN_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
const JWT_PASSWORD_SECRET = process.env.JWT_PASSWORD_SECRET
const ACCESS_TOKEN_EXPIRES_IN = '60m' // 60 minutos
const REFRESH_TOKEN_EXPIRES_IN = '8h' // 8 horas
const RESET_PASSWORD_EXPIRES_IN = '1h' // 1 horas

// Función para generar Access Token
const generateAccessToken = (user) => {
    return jwt.sign({ userId: user.id, role: user.role }, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
};
// Funcion para generar SuperUser Token
export const generateSuperUserToken = (user) => {
    return jwt.sign(
        { userId: user.id, role: user.role, isSuperUser: true },
        JWT_SUPERUSER_SECRET,
        { expiresIn: '4h' }
    );
};
// Función para generar Refresh Token
const generateRefreshToken = (user) => {
    return jwt.sign({ userId: user.id, role: user.role }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
};

// Función para generar el token de restablecimiento de contraseña
export const generateResetPasswordToken = (user) => {
    return jwt.sign({ userId: user.id, email: user.email }, JWT_PASSWORD_SECRET, { expiresIn: RESET_PASSWORD_EXPIRES_IN });
};

// Función para generar el token de registro
const generateRegistrationToken = (user) => {
    return jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_PASSWORD_SECRET, { expiresIn: '1h' });
};
// Función para autenticar al usuario y devolver los tokens
export const authenticateUser = async (email, password) => {
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            role: true,
            password: true,
            status: true
        }
    });

    if (!user) throw new Error('Credenciales inválidas. Verifique su correo y contraseña.');

    // Verificar si el usuario está inactivo
    if (user.status === 'INACTIVE') throw new Error('Cuenta inactiva. Contacte al administrador.');


    // Verificar la contraseña
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) throw new Error('Credenciales inválidas. Verifique su correo y contraseña.');


    const dataUser = {
        id: user.id,
        email: user.email,
        role: user.role
    }

    let accessToken;

    // Verificar si el usuario tiene el correo del superusuario
    if (user.email === process.env.SUPERUSER_EMAIL) {
        dataUser.isSuperUser = true;
        accessToken = generateSuperUserToken(user);
    } else {
        accessToken = generateAccessToken(user);
    }

    const refreshToken = generateRefreshToken(user);

    return { accessToken, refreshToken, user: dataUser };
};
//Función para registar un nuevo usuario
export const registerUser = async (email, password, role = 'USER') => {

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('El usuario ya existe');

    const newUser = await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: await bcrypt.hash(password, 10),
            role
        }
    })
    // Generar los tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    return { accessToken, refreshToken, user: newUser };
}

// Función para procesar y registrar usuarios desde un archivo Excel
export const importUsersFromExcel = async (fileBuffer) => {
    try {
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const usersData = xlsx.utils.sheet_to_json(sheet);

        return await prisma.$transaction(async (prisma) => {
            const usersToRegister = [];

            for (const userData of usersData) {
                const { firstName, lastName, email, rol } = userData;
                if (!email) throw new Error('El archivo contiene usuarios sin email.');

                // Verificar si el usuario ya existe
                const existingUser = await prisma.user.findUnique({ where: { email } });
                if (existingUser) continue;

                const password = generateRandomPassword();
                const hashedPassword = await bcrypt.hash(password, 10);

                // Crear el usuario
                const newUser = await prisma.user.create({
                    data: { firstName, lastName, email, password: hashedPassword, role: rol || 'USER' }
                });

                usersToRegister.push(newUser);
            }

            if (usersToRegister.length === 0) {
                throw new Error('No se importaron nuevos usuarios.');
            }

            return { message: 'Usuarios importados correctamente', count: usersToRegister.length };
        });
    } catch (error) {
        throw new Error(`Error al importar usuarios: ${error.message}`);
    }
};


// Función para solicitar restablecimiento de contraseña
export const requestPasswordReset = async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new Error('Usuario no encontrado');

    const resetToken = generateResetPasswordToken(user);

    // Guardar el token en la base de datos con una expiración
    await prisma.user.update({
        where: { email },
        data: { resetToken, resetTokenExpires: new Date(Date.now() + 3600000) } // Expira en 1 hora
    });

    // Enviar email con el enlace de restablecimiento
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = 'Restablecimiento de contraseña';
    const text = `Hola,\n\nHas solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para restablecerla:\n\n${resetLink}\n\nSi no solicitaste esto, ignora este correo.\n\nSaludos,\nTu equipo`;

    await sendEmail(email, subject, text);

    return { message: 'Correo de restablecimiento enviado' };
};
// Función para restablecer la contraseña
export const resetPassword = async (token, newPassword) => {
    let decoded;
    try {
        decoded = jwt.verify(token, JWT_PASSWORD_SECRET);
    } catch (error) {
        throw new Error('Token inválido o expirado');
    }

    const user = await prisma.user.findUnique({
        where: { id: decoded.userId, email: decoded.email }
    });

    if (!user || user.resetToken !== token || new Date(user.resetTokenExpires) < new Date()) {
        throw new Error('Token inválido o expirado');
    }

    // Actualizar la contraseña
    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: await bcrypt.hash(newPassword.password, 10)
        }
    });

    return { message: 'Contraseña restablecida con éxito' };
};

// // Función para cambiar la contraseña
export const changePassword = async (userId, oldPassword, newPassword) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true }
    });

    if (!user) throw new Error('Usuario no encontrado');

    // Verificar si la contraseña actual es correcta
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error('La contraseña actual es incorrecta');

    // Verificar si la nueva contraseña es igual a la antigua
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) throw new Error('La nueva contraseña no puede ser igual a la anterior');

    // Hashear la nueva contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña en la base de datos
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
    });

    return { message: 'Contraseña actualizada exitosamente' };
};

// Función para verificar un access token
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, JWT_ACCESS_SECRET);
    } catch (error) {
        throw new Error('Access token inválido o expirado');
    }
};

// Función para verificar un superuser token
export const verifySuperUserToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SUPERUSER_SECRET);

        // Verificar si el usuario es un superusuario
        if (!decoded.isSuperUser) {
            throw new Error('Acceso denegado');
        }

        return decoded;  // Retornar el payload decodificado si es válido
    } catch (error) {
        throw new Error('Token inválido o expirado');
    }
};
// Función para verificar un refresh token
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
        throw new Error('Refresh token inválido o expirado');
    }
};

// Función para renovar el access token utilizando el refresh token
export const refreshAccessToken = async (refreshToken) => {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) throw new Error('Usuario no encontrado');

    const newAccessToken = generateAccessToken(user);

    return newAccessToken;
};
