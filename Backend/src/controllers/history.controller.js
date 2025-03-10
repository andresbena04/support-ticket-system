import { addHistoryEntry, getHistoryByTicket } from '../services/history.service.js';

export const newHistoryEntry = async (req, res) => {
    try {
        const history = await addHistoryEntry(req.body);
        res.status(201).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar entrada al historial' });
    }
};

export const fetchHistoryByTicket = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'ID del ticket es requerido' });
        }

        const history = await getHistoryByTicket(parseInt(id));
        res.json(history);
    } catch (error) {
        res.status(404).json({ message: error.message || 'Error al obtener el historial del ticket' });
    }
};
