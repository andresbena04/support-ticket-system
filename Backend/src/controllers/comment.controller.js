import { createComment, deleteComment, getCommentsByTicket, updateComment } from '../services/comment.service.js';

export const newComment = async (req, res) => {
    try {
        const comment = await createComment(req.body);
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el comentario' });
    }
};

export const fetchCommentsByTicket = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'ID del ticket es requerido' });
        }

        const comments = await getCommentsByTicket(parseInt(id));

        res.json(comments);
    } catch (error) {
        res.status(404).json({ message: error.message || 'Error al obtener comentarios del ticket' });
    }
};

export const updateCommentHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'El contenido del comentario es requerido' });
        }

        const updatedComment = await updateComment(id, content);
        res.json({ message: 'Comentario actualizado correctamente', updatedComment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeComment = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'ID del ticket es requerido' });
        }

        await deleteComment(parseInt(id));
        res.json({ message: 'Comentario eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el comentario' });
    }
};
