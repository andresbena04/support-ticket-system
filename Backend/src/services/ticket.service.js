import { prisma } from '../config/db.js';

// Función para crear un nuevo ticket en la base de datos
export const createTicket = async (data) => {
    try {
        // Usamos Prisma para crear un nuevo ticket usando los datos proporcionados en 'data'
        return await prisma.ticket.create({ data });
    } catch (error) {
        throw new Error('No se pudo crear el ticket');
    }
};

// Función para obtener todos los tickets, incluidos los comentarios e historial asociados
export const getTickets = async () => {
    try {
        // Consultamos todos los tickets en la base de datos, incluyendo los comentarios y el historial de cada ticket
        const tickets = await prisma.ticket.findMany({
            include: { comments: true, history: true}
        });

        // Si hay tickets, los devolvemos; si no, devolvemos un arreglo vacío
        return tickets.length > 0 ? tickets : [];
    } catch (error) {
        throw new Error('Error al obtener los tickets');
    }
};

// Función para obtener un ticket específico por su ID
export const getTicketById = async (id) => {
    try {
        // Consultamos el ticket con el ID proporcionado, incluyendo sus comentarios e historial
        const ticket = await prisma.ticket.findUnique({
            where: { id: Number(id) },
            include: { comments: true, history: true, user: { select: { email: true } }  }
        });

        // Devolvemos el ticket encontrado
        return ticket;
    } catch (error) {
        throw new Error(`No se encontró el ticket con ID: ${id}`);
    }
};

// Función para obtener los tickets de un usuario específico por su ID
export const getTicketsByUserId = async (userId) => {
    try {
        // Consultamos todos los tickets donde el userId coincida, incluyendo comentarios e historial
        const tickets = await prisma.ticket.findMany({
            where: { userId: Number(userId) },
            include: { comments: true, history: true }
        });

        // Devolvemos los tickets encontrados o un arreglo vacío si no hay resultados
        return tickets.length > 0 ? tickets : [];
    } catch (error) {
        throw new Error(`Error al obtener los tickets del usuario con ID: ${userId}`);
    }
};

// Función para actualizar los datos de un ticket existente
export const updateTicket = async (id, data) => {
    try {
        // Usamos Prisma para actualizar el ticket con el ID proporcionado y los nuevos datos
        return await prisma.ticket.update({
            where: { id: Number(id) },
            data
        });
    } catch (error) {
        throw new Error(`No se pudo actualizar el ticket con ID: ${id}`);
    }
};

// Función para eliminar un ticket de la base de datos
export const deleteTicket = async (id) => {
    try {
        // Usamos Prisma para eliminar el ticket con el ID proporcionado
        await prisma.ticket.delete({ where: { id: Number(id) } });
    } catch (error) {
        throw new Error(`No se pudo eliminar el ticket con ID: ${id}`);
    }
};
