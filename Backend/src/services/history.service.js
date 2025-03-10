import { prisma } from '../config/db.js';

// Función para agregar una entrada al historial de un ticket
export const addHistoryEntry = async (data) => {
    try {
        // Usamos Prisma para crear una nueva entrada en la tabla 'history' con los datos proporcionados
        return await prisma.history.create({ data });
    } catch (error) {
       throw new Error('No se pudo agregar el historial');
    }
};

// Función para obtener el historial de un ticket específico por su ticketId
export const getHistoryByTicket = async (ticketId) => {
    try {
        // Consultamos el historial del ticket, incluyendo información del usuario (email)
        const history = await prisma.history.findMany({
            where: { ticketId },
            include: {
                user: { select: { email: true } } // Incluir solo el email del usuario
            }
        });
        // Si no hay registros de historial, lanzamos un error
        if (history.length === 0) {
            throw new Error(`No se encontraron registros de historial para este ticket con ID: ${ticketId}`);
        }

        // Retornamos los registros con el email del usuario
        return history;
    } catch (error) {
        throw new Error(error.message || 'Error al obtener el historial');
    }
};

