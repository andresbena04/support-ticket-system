import express from "express";
import cors from "cors";
import router from "./routes/routes.js";
import { PORT } from "./config/config.js";
import { errorHandler, handleNotFound } from "../src/utils/errorHandler.js";
const app = express()

// Middlewares
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors())

// Routes
app.use('/api', router);

//Error handler
app.use(handleNotFound)
app.use(errorHandler)

// Listen
app.listen(PORT, () => {
    console.log('Server on PORT: ', PORT);
});
