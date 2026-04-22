import { Router } from "express";
import {
  consultDataBaseAdmin,
  deleteUserDataBaseAdmin,
  sendRegister,
} from "../controllers/controllersCadastro";
import { validationUser } from "../controllers/controllersLogin";
import {
  postAnimeDb,
  getAllAnimesDb,
  updateAnimeDb,
  getIdAnime,
  getCategoryIdAnime,
} from "../controllers/controllersAnimesRomance";
import {
  esqueciSenha,
  redifinirSenha,
} from "../controllers/controllersRecuperarSenha";
import {
  getUserAnimeList,
  getUserAnimeListByAnime,
  removeAnimeFromUserList,
  upsertAnimeInUserList,
} from "../controllers/controllersUserAnimeList";

const router = Router();

// Rota da tela de registro da plataforma
router.post("/register", sendRegister);
// Rotas da tela de Admin da plataforma
router.get("/admin/all-users", consultDataBaseAdmin);
router.delete("/admin/delete-user/:id", deleteUserDataBaseAdmin);
// Rota da tela de login da plataforma
router.post("/login", validationUser);
// Rota recuperação de senha da plataforma
router.post("/esqueci-senha", esqueciSenha);
router.post("/redefinir-senha", redifinirSenha);

//Rota dos animes
router.post("/send-anime", postAnimeDb);
router.get("/get-anime", getAllAnimesDb);
router.put("/atualiza-anime/:id", updateAnimeDb);
router.get("/animes/:id", getIdAnime);
router.get("/animes/category/:id", getCategoryIdAnime);
router.get("/users/:userId/anime-lists", getUserAnimeList);
router.get("/users/:userId/anime-lists/:animeId", getUserAnimeListByAnime);
router.put("/users/:userId/anime-lists/:animeId", upsertAnimeInUserList);
router.delete(
  "/users/:userId/anime-lists/:animeId/:listType",
  removeAnimeFromUserList,
);

export default router;
