"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllersCadastro_1 = require("../controllers/controllersCadastro");
const controllersLogin_1 = require("../controllers/controllersLogin");
const animes_service_1 = require("../services/animes.service");
const controllersAnimesRomance_1 = require("../controllers/controllersAnimesRomance");
const router = (0, express_1.Router)();
// Rota da tela de registro da plataforma
router.post("/register", controllersCadastro_1.sendRegister);
// Rotas da tela de Admin da plataforma
router.get("/admin/all-users", controllersCadastro_1.consultDataBaseAdmin);
router.delete("/admin/delete-user/:id", controllersCadastro_1.deleteUserDataBaseAdmin);
// Rota da tela de login da plataforma
router.post("/login", controllersLogin_1.validationUser);
//Rota dos animes
router.get("/animes-romance", animes_service_1.searchAnimesRomance);
router.post("/send-romance", controllersAnimesRomance_1.postRomanceDb);
router.get("/get-romance", controllersAnimesRomance_1.getAllRomanceDb);
exports.default = router;
//# sourceMappingURL=routes.js.map