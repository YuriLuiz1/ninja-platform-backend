import express from "express";
import router from "./routes/routes";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import type { Request, Response } from "express";

dotenv.config();


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', router);

const port = Number(process.env.PORT) || 3000;

app.listen(port, "0.0.0.0", () => {
    console.log("Servidor escutando!");
})

export default app;

