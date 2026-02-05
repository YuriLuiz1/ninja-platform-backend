import { Router } from "express";
import {
  consultDataBaseAdmin,
  deleteUserDataBaseAdmin,
  sendRegister,
} from "../controllers/controllersCadastro";
import { validationUser } from "../controllers/controllersLogin";
import { getAllRomanceDb, getIdRomance, postRomanceDb, updateRomanceDb } from "../controllers/controllersAnimesRomance";

const router = Router();

// Rota da tela de registro da plataforma
router.post("/register", sendRegister);

// Rotas da tela de Admin da plataforma
router.get("/admin/all-users", consultDataBaseAdmin);
router.delete("/admin/delete-user/:id", deleteUserDataBaseAdmin);

// Rota da tela de login da plataforma
router.post("/login", validationUser);

//Rota dos animes Romance
router.post("/send-romance", postRomanceDb);
router.get("/get-romance", getAllRomanceDb);
router.put("/atualiza-romance/:id", updateRomanceDb);
router.get("/anime-romance/:id", getIdRomance);

export default router;
