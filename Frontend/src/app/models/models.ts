import { ICellRendererParams } from "ag-grid-community";

export interface user {
    username: string,
    password: string
}
export interface users {
    id?: number,
    password?: string,
    email: string,
    role: string,
    createdAt?: Date,
    updatedAt?: Date
}
export interface tickets {
    id?: number,
    title: string,
    description: string,
    status?: string,
    priority?: string,
    createdAt?: Date,
    updatedAt?: Date,
    userId: number
    history?: history[],
    user?: { email: string }
}
export interface history {
    id?: number,
    action: string,
    createdAt?: Date,
    userId: number,
    ticketId: number,
    user?: { email: string }
}
export interface comments {
    id?: number,
    content: string,
    createdAt?: Date,
    userId: number,
    ticketId: number,
    user?: { email: string },
    isNewDay?: boolean, // Propiedad para saber si es un nuevo día
    isToday?: boolean // Propiedad para saber si es el día de hoy
}
export interface ActionButtonsParams extends ICellRendererParams {
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onView: (id: number) => void;
    hideActions: boolean
}