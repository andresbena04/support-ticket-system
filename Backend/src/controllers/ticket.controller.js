import { createTicket, getTickets, getTicketById, updateTicket, deleteTicket, getTicketsByUserId } from '../services/ticket.service.js';

export const createNewTicket = async (req, res) => {
    try {
        const ticket = await createTicket(req.body);
        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el ticket'});
    }
};

export const fetchTickets = async (req, res) => {
    try {
        const tickets = await getTickets();
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los tickets' });
    }
};

export const fetchTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'ID del ticket es requerido' });
        }

        const ticket = await getTicketById(parseInt(id));
        if (!ticket) {
            return res.status(404).json({ message: `No se encontró el ticket con ID: ${id}` });
        }

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el ticket' });
    }
};

export const fetchTicketByUserId = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'ID de usuario requerido' });
        }

        const ticket = await getTicketsByUserId(parseInt(id));
        if (!ticket) {
            return res.status(404).json({ message: `No se encontraron tickets para el usuario con ID: ${id}` });
        }

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los tickets' });
    }
};

export const modifyTicket = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'ID del ticket es requerido' });
        }

        const ticket = await updateTicket(parseInt(id), req.body);
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el ticket' });
        
    }
};

export const removeTicket = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'ID del ticket es requerido' });
        }

        await deleteTicket(parseInt(id));
        res.json({ message: 'Ticket eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el ticket' });
    }
};
