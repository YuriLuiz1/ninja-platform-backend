import express from "express";
import router from "./routes/routes";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', router);

app.listen(process.env.PORT, () => {
    console.log("Servidor escutando!");
})

export default app;

