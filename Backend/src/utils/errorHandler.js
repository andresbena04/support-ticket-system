export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
}
export const handleNotFound = (req, res, next) => {
    res.status(404).json({ message: 'The route does not exist' });
}