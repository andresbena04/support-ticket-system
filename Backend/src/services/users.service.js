import { prisma } from '../config/db.js';

// Obtener la lista de usuarios (excluyendo el campo password)
export const getUsers = async () => {
    try {
        return await prisma.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true
            }
        });
    } catch (error) {
        throw new Error('Error al obtener la lista de usuarios');
    }
};

// Obtener un usuario por ID (excluyendo el campo password)
export const getUserById = async (id) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { tickets: true } // Cuenta la cantidad de tickets creados por el usuario
                }
            }
        });
        
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        
        return user;
    } catch (error) {
        throw new Error(error.message || 'Error al obtener el usuario');
    }
};

// Editar un usuario por ID
export const updateUser = async (id, data) => {
    try {
        return await prisma.user.update({
            where: { id },
            data
        });
    } catch (error) {
        throw new Error('Error al actualizar el usuario');
    }
};

// Eliminar un usuario por ID
export const deleteUser = async (id) => {
    try {
        return await prisma.user.delete({
            where: { id }
        });
    } catch (error) {
        throw new Error('Error al eliminar el usuario');
    }
};
