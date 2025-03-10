import dotenv from 'dotenv';

dotenv.config();

export const JWT_KEY = process.env.JWT_KEY

export const PORT = process.env.PORT || 3000;