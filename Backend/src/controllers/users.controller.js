import { getUsers, getUserById, deleteUser, updateUser } from "../services/users.service.js";

export const fetchUsers = async (req, res) => {
    try {
        const users = await getUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los usuarios' });
    }
};

export const fetchUserById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'ID del usuario es requerido' });
        }

        const user = await getUserById(parseInt(id));
        if (!user) {
            return res.status(404).json({ message: `No se encontró el usuario con ID: ${id}` });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el usuario' });
    }
};

export const modifyUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'ID del usuario es requerido' });
        }

        const user = await updateUser(parseInt(id), req.body);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el usuario' });
    }
};

export const removeUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'ID del usuario es requerido' });
        }

        await deleteUser(parseInt(id));
        res.json({ message: 'User eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el usuario' });
    }
};
