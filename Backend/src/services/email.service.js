import nodemailer from 'nodemailer';

// Crear un transporter usando el servicio de Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Tu dirección de correo de Gmail
        pass: process.env.EMAIL_PASSWORD, // Tu contraseña o una clave de aplicación
    },
});

// Función para enviar correo electrónico
export const sendEmail = (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER, // Dirección de correo del remitente
        to, // Dirección de correo del destinatario
        subject, // Asunto del correo
        text, // Cuerpo del correo
    };

    return transporter.sendMail(mailOptions);
};