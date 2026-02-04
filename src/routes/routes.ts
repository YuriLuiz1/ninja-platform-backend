import { Router } from "express";
import {
  consultDataBaseAdmin,
  deleteUserDataBaseAdmin,
  sendRegister,
} from "../controllers/controllersCadastro";
import { validationUser } from "../controllers/controllersLogin";
import { getAllRomanceDb, postRomanceDb } from "../controllers/controllersAnimesRomance";

const router = Router();

// Rota da tela de registro da plataforma
router.post("/register", sendRegister);

// Rotas da tela de Admin da plataforma
router.get("/admin/all-users", consultDataBaseAdmin);
router.delete("/admin/delete-user/:id", deleteUserDataBaseAdmin);

// Rota da tela de login da plataforma
router.post("/login", validationUser);

//Rota dos animes
router.post("/send-romance", postRomanceDb);
router.get("/get-romance", getAllRomanceDb);

export default router;
