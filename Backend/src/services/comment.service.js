import { prisma } from '../config/db.js';

// Función para crear un nuevo comentario 
export const createComment = async (data) => {
    try {
        // Usamos Prisma para crear una nueva entrada en la tabla 'comments' con los datos proporcionados
        return await prisma.comment.create({ data });
    } catch (error) {
        throw new Error('No se pudo agregar el comentario');
    }
};
//Funcion para obtener todos los comentarios de un ticket
export const getCommentsByTicket = async (ticketId) => {
    try {
        // Consultamos las entradas de historial para un ticket específico, usando el ticketId
        const comments = await prisma.comment.findMany({
            where: { ticketId },
            include: { user: { select: { email: true } } }
        });
        // Si no se encuentran comentarios del ticket, lanzamos un error indicando que no hay comentarios  
        if (comments.length === 0) {
            throw new Error('No se encontraron comentarios para este ticket');
        }

        // Si encontramos registros, los devolvemos
        return comments;
    } catch (error) {
        throw new Error(error.message || 'Error al obtener los comentarios del ticket');
    }
};
// Función para actualizar un comentario
export const updateComment = async (id, content) => {
    try {
        // Verificar si el comentario existe antes de actualizarlo
        const existingComment = await prisma.comment.findUnique({ where: { id: Number(id) } });
        if (!existingComment) {
            throw new Error(`No se encontró el comentario con ID: ${id}`);
        }

        // Actualizar el comentario con el nuevo contenido
        return await prisma.comment.update({
            where: { id: Number(id) },
            data: { content }
        });
    } catch (error) {
        throw new Error(error.message || `No se pudo actualizar el comentario con ID: ${id}`);
    }
};
// Función para eliminar un comentario de un ticket
export const deleteComment = async (id) => {
    try {
        // Usamos Prisma para eliminar el comentario con el ID proporcionado
        await prisma.comment.delete({ where: { id: Number(id) } });
    } catch (error) {
        throw new Error(`No se pudo eliminar el comentario con ID: ${id}`);
    }
};