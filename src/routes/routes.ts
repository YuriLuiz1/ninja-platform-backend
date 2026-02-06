import { Router } from "express";
import {
  consultDataBaseAdmin,
  deleteUserDataBaseAdmin,
  sendRegister,
} from "../controllers/controllersCadastro";
import { validationUser } from "../controllers/controllersLogin";
import { postAnimeDb, getAllAnimesDb, updateAnimeDb, getIdAnime } from "../controllers/controllersAnimesRomance";

const router = Router();

// Rota da tela de registro da plataforma
router.post("/register", sendRegister);

// Rotas da tela de Admin da plataforma
router.get("/admin/all-users", consultDataBaseAdmin);
router.delete("/admin/delete-user/:id", deleteUserDataBaseAdmin);

// Rota da tela de login da plataforma
router.post("/login", validationUser);

//Rota dos animes Romance
router.post("/send-anime", postAnimeDb);
router.get("/get-anime", getAllAnimesDb);
router.put("/atualiza-anime/:id", updateAnimeDb);
router.get("/animes/:id", getIdAnime);

export default router;
